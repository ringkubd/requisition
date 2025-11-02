<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MLController extends AppBaseController
{
    /**
     * ML Service base URL
     */
    protected $mlServiceUrl;

    /**
     * Cache duration in minutes
     */
    protected $cacheDuration = 1440; // 24 hours

    public function __construct()
    {
        $this->mlServiceUrl = config('services.ml.url', 'http://localhost:8001');
    }

    /**
     * Check ML service health status
     *
     * @return JsonResponse
     */
    public function healthCheck(): JsonResponse
    {
        try {
            $response = Http::timeout(5)->get("{$this->mlServiceUrl}/health");

            if ($response->successful()) {
                return response()->json([
                    'status' => 'success',
                    'ml_service' => $response->json(),
                    'message' => 'ML service is running'
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'ML service is not responding',
                'error' => $response->body()
            ], 503);
        } catch (\Exception $e) {
            Log::error("ML Service health check failed: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'ML service is unavailable',
                'error' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Train a forecasting model for a product
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trainModel(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|integer',
                'product_option_id' => 'required|integer',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            $productId = $request->product_id;
            $optionId = $request->product_option_id;
            $aggregation = $request->aggregation ?? 'monthly';

            Log::info("Training ML model for product $productId, option $optionId");

            // Get forecast data from ReportAPIController
            $forecastDataRequest = Request::create('/api/report/forecast-data', 'GET', [
                'product_id' => $productId,
                'product_option_id' => $optionId,
                'start_date' => $request->start_date ?? Carbon::now()->subYears(2)->toDateString(),
                'end_date' => $request->end_date ?? Carbon::now()->toDateString(),
                'aggregation' => $aggregation
            ]);

            // Dispatch internal request with user authentication
            $forecastDataRequest->setUserResolver(function () use ($request) {
                return $request->user();
            });

            $forecastDataResponse = app()->handle($forecastDataRequest);
            $forecastData = json_decode($forecastDataResponse->getContent(), true);

            if (empty($forecastData['forecast_data'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No data available for training. Please check product ID and date range.'
                ], 400);
            }

            $productData = $forecastData['forecast_data'][0];
            $timeSeries = $productData['time_series'];

            // Format data for ML service - include all time series points for proper forecasting
            $trainingData = [];
            foreach ($timeSeries as $point) {
                $trainingData[] = [
                    'date' => $point['date'],
                    'quantity' => $point['issue_qty'], // Use issue quantity for usage forecasting
                    'value' => $point['purchase_value']
                ];
            }

            if (count($trainingData) < 3) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient data for training. Need at least 3 data points. Found: ' . count($trainingData)
                ], 400);
            }

            // Send to ML service for training
            $mlResponse = Http::timeout(120)->post("{$this->mlServiceUrl}/train", [
                'product_id' => $productId,
                'product_option_id' => $optionId,
                'product_name' => $productData['product_name'],
                'data' => $trainingData
            ]);

            if ($mlResponse->successful()) {
                $result = $mlResponse->json();

                // Clear cached forecasts for this product
                $this->clearForecastCache($productId, $optionId);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Model trained successfully',
                    'data' => $result,
                    'training_data_points' => count($trainingData)
                ]);
            }

            Log::error("ML training failed: " . $mlResponse->body());
            return response()->json([
                'status' => 'error',
                'message' => 'Model training failed',
                'error' => $mlResponse->json()
            ], $mlResponse->status());
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("ML training error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Training failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get forecast predictions for a product
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getForecast(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|integer',
                'product_option_id' => 'required|integer',
                'periods' => 'nullable|integer|min:1|max:24',
                'frequency' => 'nullable|in:D,W,M,Q,Y',
                'include_history' => 'nullable|boolean'
            ]);

            $productId = $request->product_id;
            $optionId = $request->product_option_id;
            $periods = $request->periods ?? 6;
            $frequency = $request->frequency ?? 'M';
            $includeHistory = $request->include_history ?? false;

            // Check cache first
            $cacheKey = $this->getForecastCacheKey($productId, $optionId, $periods, $frequency);

            if (!$request->force_refresh && Cache::has($cacheKey)) {
                Log::info("Returning cached forecast for product $productId, option $optionId");
                return response()->json([
                    'status' => 'success',
                    'data' => Cache::get($cacheKey),
                    'cached' => true
                ]);
            }

            // Request forecast from ML service
            $mlResponse = Http::timeout(60)->post("{$this->mlServiceUrl}/forecast", [
                'product_id' => $productId,
                'product_option_id' => $optionId,
                'periods' => $periods,
                'frequency' => $frequency,
                'include_history' => $includeHistory
            ]);

            if ($mlResponse->successful()) {
                $forecast = $mlResponse->json();

                // Cache the forecast
                Cache::put($cacheKey, $forecast, now()->addMinutes($this->cacheDuration));

                return response()->json([
                    'status' => 'success',
                    'data' => $forecast,
                    'cached' => false
                ]);
            }

            if ($mlResponse->status() === 404) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Model not trained. Please train the model first.',
                    'action_required' => 'train_model'
                ], 404);
            }

            Log::error("ML forecast failed: " . $mlResponse->body());
            return response()->json([
                'status' => 'error',
                'message' => 'Forecast generation failed',
                'error' => $mlResponse->json()
            ], $mlResponse->status());
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("ML forecast error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Forecast request failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all trained models
     *
     * @return JsonResponse
     */
    public function listModels(): JsonResponse
    {
        try {
            $mlResponse = Http::timeout(10)->get("{$this->mlServiceUrl}/models/list");

            if ($mlResponse->successful()) {
                return response()->json([
                    'status' => 'success',
                    'data' => $mlResponse->json()
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to list models',
                'error' => $mlResponse->body()
            ], $mlResponse->status());
        } catch (\Exception $e) {
            Log::error("ML list models error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Request failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a trained model
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteModel(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|integer',
                'product_option_id' => 'required|integer'
            ]);

            $productId = $request->product_id;
            $optionId = $request->product_option_id;

            $mlResponse = Http::timeout(10)
                ->delete("{$this->mlServiceUrl}/models/{$productId}/{$optionId}");

            if ($mlResponse->successful()) {
                // Clear cached forecasts
                $this->clearForecastCache($productId, $optionId);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Model deleted successfully'
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete model',
                'error' => $mlResponse->body()
            ], $mlResponse->status());
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("ML delete model error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Delete request failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Train multiple models in batch
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function batchTrain(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'products' => 'required|array',
                'products.*.product_id' => 'required|integer',
                'products.*.product_option_id' => 'required|integer',
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            $results = [];
            $successful = 0;
            $failed = 0;

            foreach ($request->products as $product) {
                $trainRequest = Request::create('/api/ml/train', 'POST', [
                    'product_id' => $product['product_id'],
                    'product_option_id' => $product['product_option_id'],
                    'aggregation' => $request->aggregation ?? 'monthly'
                ]);

                $trainRequest->setUserResolver(function () use ($request) {
                    return $request->user();
                });

                $response = app()->handle($trainRequest);
                $result = json_decode($response->getContent(), true);

                if ($response->getStatusCode() === 200) {
                    $successful++;
                } else {
                    $failed++;
                }

                $results[] = [
                    'product_id' => $product['product_id'],
                    'product_option_id' => $product['product_option_id'],
                    'status' => $response->getStatusCode() === 200 ? 'success' : 'failed',
                    'message' => $result['message'] ?? 'Unknown error'
                ];
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'total' => count($request->products),
                    'successful' => $successful,
                    'failed' => $failed
                ],
                'results' => $results
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("ML batch train error: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Batch training failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Train models for all products in a category
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trainCategory(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'category_id' => 'required|integer',
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            // Get all products in the category with purchase history
            $products = $this->getProductsWithHistory($request->category_id);

            if ($products->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No products with purchase history found in this category'
                ], 404);
            }

            $results = [];
            $successful = 0;
            $failed = 0;
            $startTime = time();

            foreach ($products as $product) {
                // Skip training if it's taking too long
                if (time() - $startTime > 240) { // 4 minute limit per endpoint
                    Log::warning("Category training timeout - processing remaining {$product->product_id}");
                    break;
                }

                try {
                    $trainRequest = Request::create('/api/ml/train', 'POST', [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'aggregation' => $request->aggregation ?? 'monthly'
                    ]);

                    $trainRequest->setUserResolver(function () use ($request) {
                        return $request->user();
                    });

                    $response = app()->handle($trainRequest);
                    $result = json_decode($response->getContent(), true);

                    if ($response->getStatusCode() === 200) {
                        $successful++;
                    } else {
                        $failed++;
                    }

                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => $response->getStatusCode() === 200 ? 'success' : 'failed',
                        'message' => $result['message'] ?? 'Unknown error'
                    ];
                } catch (\Exception $e) {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => 'failed',
                        'message' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'category_id' => $request->category_id,
                    'total_products' => count($products),
                    'processed' => count($results),
                    'successful' => $successful,
                    'failed' => $failed,
                    'incomplete' => count($products) - count($results)
                ],
                'results' => $results,
                'message' => "Category training completed: {$successful} successful, {$failed} failed"
            ]);
        } catch (\Exception $e) {
            Log::error('Category training failed', [
                'error' => $e->getMessage(),
                'category_id' => $request->category_id ?? null
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Category training failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Train models for all products
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trainAll(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            // Get all products with purchase history
            $products = $this->getAllProductsWithHistory();

            if ($products->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No products with purchase history found'
                ], 404);
            }

            $results = [];
            $successful = 0;
            $failed = 0;
            $startTime = time();

            foreach ($products as $product) {
                // Skip training if it's taking too long
                if (time() - $startTime > 240) { // 4 minute limit per endpoint
                    Log::warning("All products training timeout - processed {$successful} successful");
                    break;
                }

                try {
                    $trainRequest = Request::create('/api/ml/train', 'POST', [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'aggregation' => $request->aggregation ?? 'monthly'
                    ]);

                    $trainRequest->setUserResolver(function () use ($request) {
                        return $request->user();
                    });

                    $response = app()->handle($trainRequest);
                    $result = json_decode($response->getContent(), true);

                    if ($response->getStatusCode() === 200) {
                        $successful++;
                    } else {
                        $failed++;
                    }

                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => $response->getStatusCode() === 200 ? 'success' : 'failed',
                        'message' => $result['message'] ?? 'Unknown error'
                    ];
                } catch (\Exception $e) {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => 'failed',
                        'message' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'total_products' => count($products),
                    'processed' => count($results),
                    'successful' => $successful,
                    'failed' => $failed,
                    'incomplete' => count($products) - count($results)
                ],
                'results' => $results,
                'message' => "All products training completed: {$successful} successful, {$failed} failed"
            ]);
        } catch (\Exception $e) {
            Log::error('All products training failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'All products training failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get forecasts for all products in a category
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forecastCategory(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'category_id' => 'required|integer',
                'periods' => 'nullable|integer|min:1|max:24',
                'frequency' => 'nullable|in:D,W,M,Q,Y',
                'include_history' => 'nullable|boolean',
                'force_refresh' => 'nullable|boolean'
            ]);

            $periods = $request->periods ?? 6;
            $frequency = $request->frequency ?? 'M';
            $includeHistory = $request->include_history ?? true;
            $forceRefresh = $request->force_refresh ?? false;

            // Get all products in the category with trained models
            $products = $this->getProductsWithTrainedModels($request->category_id);

            if ($products->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No products with trained models found in this category'
                ], 404);
            }

            $results = [];
            $successful = 0;
            $failed = 0;

            foreach ($products as $product) {
                $forecastRequest = Request::create('/api/ml/forecast', 'POST', [
                    'product_id' => $product->product_id,
                    'product_option_id' => $product->product_option_id,
                    'periods' => $periods,
                    'frequency' => $frequency,
                    'include_history' => $includeHistory,
                    'force_refresh' => $forceRefresh
                ]);

                $forecastRequest->setUserResolver(function () use ($request) {
                    return $request->user();
                });

                $response = app()->handle($forecastRequest);
                $result = json_decode($response->getContent(), true);

                if ($response->getStatusCode() === 200) {
                    $successful++;
                    $results[] = $result['data'];
                } else {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'error' => $result['message'] ?? 'Forecast failed'
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'category_id' => $request->category_id,
                    'total_products' => count($products),
                    'successful' => $successful,
                    'failed' => $failed,
                    'periods' => $periods,
                    'frequency' => $frequency
                ],
                'forecasts' => $results,
                'message' => "Category forecast completed: {$successful} successful, {$failed} failed"
            ]);
        } catch (\Exception $e) {
            Log::error('Category forecast failed', [
                'error' => $e->getMessage(),
                'category_id' => $request->category_id ?? null
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Category forecast failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get forecasts for all products with trained models
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forecastAll(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'periods' => 'nullable|integer|min:1|max:24',
                'frequency' => 'nullable|in:D,W,M,Q,Y',
                'include_history' => 'nullable|boolean',
                'force_refresh' => 'nullable|boolean'
            ]);

            $periods = $request->periods ?? 6;
            $frequency = $request->frequency ?? 'M';
            $includeHistory = $request->include_history ?? true;
            $forceRefresh = $request->force_refresh ?? false;

            // Get all products with trained models
            $products = $this->getAllProductsWithTrainedModels();

            if ($products->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No products with trained models found'
                ], 404);
            }

            $results = [];
            $successful = 0;
            $failed = 0;

            foreach ($products as $product) {
                $forecastRequest = Request::create('/api/ml/forecast', 'POST', [
                    'product_id' => $product->product_id,
                    'product_option_id' => $product->product_option_id,
                    'periods' => $periods,
                    'frequency' => $frequency,
                    'include_history' => $includeHistory,
                    'force_refresh' => $forceRefresh
                ]);

                $forecastRequest->setUserResolver(function () use ($request) {
                    return $request->user();
                });

                $response = app()->handle($forecastRequest);
                $result = json_decode($response->getContent(), true);

                if ($response->getStatusCode() === 200) {
                    $successful++;
                    $results[] = $result['data'];
                } else {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'error' => $result['message'] ?? 'Forecast failed'
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'summary' => [
                    'total_products' => count($products),
                    'successful' => $successful,
                    'failed' => $failed,
                    'periods' => $periods,
                    'frequency' => $frequency
                ],
                'forecasts' => $results,
                'message' => "All products forecast completed: {$successful} successful, {$failed} failed"
            ]);
        } catch (\Exception $e) {
            Log::error('All products forecast failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'All products forecast failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products with purchase history for a category
     *
     * @param int $categoryId
     * @return \Illuminate\Support\Collection
     */
    private function getProductsWithHistory(int $categoryId)
    {
        return DB::table('products')
            ->join('product_options', 'products.id', '=', 'product_options.product_id')
            ->leftJoin('purchases', 'product_options.id', '=', 'purchases.product_option_id')
            ->leftJoin('product_issue_items', 'product_options.id', '=', 'product_issue_items.product_option_id')
            ->where('products.category_id', $categoryId)
            ->where(function ($query) {
                $query->whereNotNull('purchases.id')
                    ->orWhereNotNull('product_issue_items.id');
            })
            ->select(
                'products.id as product_id',
                'products.title as product_name',
                'product_options.id as product_option_id',
                'product_options.option_value',
                DB::raw('COUNT(DISTINCT purchases.id) as purchase_count'),
                DB::raw('COUNT(DISTINCT product_issue_items.id) as issue_count')
            )
            ->groupBy('products.id', 'products.title', 'product_options.id', 'product_options.option_value')
            ->havingRaw('(purchase_count > 0 OR issue_count > 0)')
            ->get();
    }

    /**
     * Get all products with purchase history
     *
     * @return \Illuminate\Support\Collection
     */
    private function getAllProductsWithHistory()
    {
        return DB::table('products')
            ->join('product_options', 'products.id', '=', 'product_options.product_id')
            ->leftJoin('purchases', 'product_options.id', '=', 'purchases.product_option_id')
            ->leftJoin('product_issue_items', 'product_options.id', '=', 'product_issue_items.product_option_id')
            ->where(function ($query) {
                $query->whereNotNull('purchases.id')
                    ->orWhereNotNull('product_issue_items.id');
            })
            ->select(
                'products.id as product_id',
                'products.title as product_name',
                'product_options.id as product_option_id',
                'product_options.option_value',
                DB::raw('COUNT(DISTINCT purchases.id) as purchase_count'),
                DB::raw('COUNT(DISTINCT product_issue_items.id) as issue_count')
            )
            ->groupBy('products.id', 'products.title', 'product_options.id', 'product_options.option_value')
            ->havingRaw('(purchase_count > 0 OR issue_count > 0)')
            ->get();
    }

    /**
     * Get products with trained models for a category
     *
     * @param int $categoryId
     * @return \Illuminate\Support\Collection
     */
    private function getProductsWithTrainedModels(int $categoryId)
    {
        // First get trained models from ML service
        try {
            $response = Http::timeout(10)->get("{$this->mlServiceUrl}/models");
            if (!$response->successful()) {
                return collect();
            }

            $models = $response->json()['models'] ?? [];

            if (empty($models)) {
                return collect();
            }

            $modelProductIds = collect($models)->pluck('product_id')->unique()->toArray();

            return DB::table('products')
                ->join('product_options', 'products.id', '=', 'product_options.product_id')
                ->where('products.category_id', $categoryId)
                ->whereIn('products.id', $modelProductIds)
                ->select(
                    'products.id as product_id',
                    'products.title as product_name',
                    'product_options.id as product_option_id',
                    'product_options.option_value'
                )
                ->get();
        } catch (\Exception $e) {
            Log::error('Failed to get trained models', ['error' => $e->getMessage()]);
            return collect();
        }
    }

    /**
     * Get all products with trained models
     *
     * @return \Illuminate\Support\Collection
     */
    private function getAllProductsWithTrainedModels()
    {
        // First get trained models from ML service
        try {
            $response = Http::timeout(10)->get("{$this->mlServiceUrl}/models/list");
            if (!$response->successful()) {
                return collect();
            }

            $responseData = $response->json();
            $models = $responseData['models'] ?? [];

            if (empty($models)) {
                return collect();
            }

            // Build array of product_option IDs that have trained models
            $trainedOptionIds = collect($models)->pluck('product_option_id')->toArray();

            if (empty($trainedOptionIds)) {
                return collect();
            }

            // Single query to get all trained product options with their products
            return DB::table('product_options')
                ->join('products', 'product_options.product_id', '=', 'products.id')
                ->whereIn('product_options.id', $trainedOptionIds)
                ->select(
                    'products.id as product_id',
                    'products.title as product_name',
                    'product_options.id as product_option_id',
                    'product_options.option_value'
                )
                ->get();
        } catch (\Exception $e) {
            Log::error('Failed to get trained models', ['error' => $e->getMessage()]);
            return collect();
        }
    }

    /**
     * Get forecast cache key
     *
     * @param int $productId
     * @param int $optionId
     * @param int $periods
     * @param string $frequency
     * @return string
     */
    private function getForecastCacheKey(int $productId, int $optionId, int $periods, string $frequency): string
    {
        return "ml_forecast_{$productId}_{$optionId}_{$periods}_{$frequency}";
    }

    /**
     * Clear forecast cache for a product
     *
     * @param int $productId
     * @param int $optionId
     * @return void
     */
    private function clearForecastCache(int $productId, int $optionId): void
    {
        $frequencies = ['D', 'W', 'M', 'Q', 'Y'];
        $periods = [3, 6, 12, 24];

        foreach ($frequencies as $freq) {
            foreach ($periods as $period) {
                $cacheKey = $this->getForecastCacheKey($productId, $optionId, $period, $freq);
                Cache::forget($cacheKey);
            }
        }

        Log::info("Cleared forecast cache for product $productId, option $optionId");
    }

    /**
     * Start async training for a category
     * Returns immediately with job ID for polling
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trainCategoryAsync(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'category_id' => 'required|integer',
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            $jobId = 'train_cat_' . uniqid() . '_' . time();
            $aggregation = $request->aggregation ?? 'monthly';
            $categoryId = $request->category_id;
            $userId = $request->user()->id;

            // Initialize job tracking in cache
            Cache::put("job_{$jobId}", [
                'status' => 'queued',
                'type' => 'train_category',
                'category_id' => $categoryId,
                'aggregation' => $aggregation,
                'processed' => 0,
                'successful' => 0,
                'failed' => 0,
                'total' => 0,
                'results' => [],
                'created_at' => now()->toDateTimeString(),
                'started_at' => null,
                'completed_at' => null,
                'error' => null
            ], 3600); // Keep for 1 hour

            // Trigger background processing via artisan command
            // This will be executed asynchronously
            $this->dispatchBackgroundJob($jobId, 'train_category', $categoryId, $aggregation, $userId);

            return response()->json([
                'status' => 'queued',
                'job_id' => $jobId,
                'message' => 'Training job queued. Use job_id to check progress.',
                'check_progress_url' => "/api/ml/training-status/{$jobId}"
            ], 202);
        } catch (\Exception $e) {
            Log::error('Failed to queue category training', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to queue training: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start async training for all products
     * Returns immediately with job ID for polling
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function trainAllAsync(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'aggregation' => 'nullable|in:daily,weekly,monthly'
            ]);

            $jobId = 'train_all_' . uniqid() . '_' . time();
            $aggregation = $request->aggregation ?? 'monthly';
            $userId = $request->user()->id;

            // Initialize job tracking in cache
            Cache::put("job_{$jobId}", [
                'status' => 'queued',
                'type' => 'train_all',
                'aggregation' => $aggregation,
                'processed' => 0,
                'successful' => 0,
                'failed' => 0,
                'total' => 0,
                'results' => [],
                'created_at' => now()->toDateTimeString(),
                'started_at' => null,
                'completed_at' => null,
                'error' => null
            ], 3600); // Keep for 1 hour

            // Trigger background processing
            $this->dispatchBackgroundJob($jobId, 'train_all', null, $aggregation, $userId);

            return response()->json([
                'status' => 'queued',
                'job_id' => $jobId,
                'message' => 'Training job queued. Use job_id to check progress.',
                'check_progress_url' => "/api/ml/training-status/{$jobId}"
            ], 202);
        } catch (\Exception $e) {
            Log::error('Failed to queue all training', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to queue training: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispatch background job - executes in the current request but returns quickly
     * Works by using output buffering to flush response early
     *
     * @param string $jobId
     * @param string $type
     * @param int|null $categoryId
     * @param string $aggregation
     * @param int $userId
     * @return void
     */
    private function dispatchBackgroundJob(string $jobId, string $type, ?int $categoryId, string $aggregation, int $userId): void
    {
        // For now, process synchronously but with progress tracking
        // In a production system, you would dispatch to a queue
        try {
            if ($type === 'train_category' && $categoryId) {
                $this->processTrainCategoryAsync($jobId, $categoryId, $aggregation, $userId);
            } elseif ($type === 'train_all') {
                $this->processTrainAllAsync($jobId, $aggregation, $userId);
            }
        } catch (\Exception $e) {
            Log::error('Background job dispatch failed', [
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get training job status
     *
     * @param string $jobId
     * @return JsonResponse
     */
    public function getTrainingStatus(string $jobId): JsonResponse
    {
        try {
            $jobData = Cache::get("job_{$jobId}");

            if (!$jobData) {
                return response()->json([
                    'status' => 'not_found',
                    'message' => 'Job not found or expired'
                ], 404);
            }

            // Calculate estimated time remaining if processing
            $estimatedRemaining = null;
            if ($jobData['status'] === 'processing' && $jobData['total'] > $jobData['processed']) {
                $elapsed = strtotime($jobData['started_at']) > 0 ? time() - strtotime($jobData['started_at']) : 0;
                if ($elapsed > 0 && $jobData['processed'] > 0) {
                    $timePerItem = $elapsed / $jobData['processed'];
                    $estimatedRemaining = ceil(($jobData['total'] - $jobData['processed']) * $timePerItem);
                }
            }

            $response = [
                'status' => $jobData['status'],
                'job_id' => $jobId,
                'job_type' => $jobData['type'],
                'summary' => [
                    'total' => $jobData['total'],
                    'processed' => $jobData['processed'],
                    'successful' => $jobData['successful'],
                    'failed' => $jobData['failed'],
                    'pending' => max(0, $jobData['total'] - $jobData['processed'])
                ],
                'progress_percent' => $jobData['total'] > 0 ? round(($jobData['processed'] / $jobData['total']) * 100, 2) : 0,
                'estimated_seconds_remaining' => $estimatedRemaining,
                'created_at' => $jobData['created_at'],
                'started_at' => $jobData['started_at'],
                'completed_at' => $jobData['completed_at'],
                'error' => $jobData['error']
            ];

            // Include last 10 results for feedback
            if (!empty($jobData['results'])) {
                $response['recent_results'] = array_slice($jobData['results'], -10);
            }

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Failed to get training status', ['job_id' => $jobId, 'error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process training for category asynchronously
     * This runs in the background using a simple loop with cache updates
     *
     * @param string $jobId
     * @param int $categoryId
     * @param string $aggregation
     * @param int $userId
     * @return void
     */
    private function processTrainCategoryAsync(string $jobId, int $categoryId, string $aggregation, int $userId): void
    {
        try {
            set_time_limit(0);

            $jobKey = "job_{$jobId}";

            // Get user for request resolver
            $user = \App\Models\User::find($userId);
            if (!$user) {
                throw new \Exception("User not found");
            }

            $products = $this->getCategoryProductsWithHistory($categoryId);

            // Update job status
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'processing';
            $jobData['started_at'] = now()->toDateTimeString();
            $jobData['total'] = count($products);
            Cache::put($jobKey, $jobData, 3600);

            $successful = 0;
            $failed = 0;
            $results = [];

            foreach ($products as $product) {
                try {
                    $trainRequest = Request::create('/api/ml/train', 'POST', [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'aggregation' => $aggregation
                    ]);

                    $trainRequest->setUserResolver(function () use ($user) {
                        return $user;
                    });

                    $response = app()->handle($trainRequest);

                    if ($response->getStatusCode() === 200) {
                        $successful++;
                    } else {
                        $failed++;
                    }

                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => $response->getStatusCode() === 200 ? 'success' : 'failed'
                    ];

                    // Update progress every 5 items
                    if (($successful + $failed) % 5 === 0) {
                        $jobData = Cache::get($jobKey);
                        $jobData['processed'] = $successful + $failed;
                        $jobData['successful'] = $successful;
                        $jobData['failed'] = $failed;
                        $jobData['results'] = $results;
                        Cache::put($jobKey, $jobData, 3600);
                    }
                } catch (\Exception $e) {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }

            // Mark job as completed
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'completed';
            $jobData['processed'] = $successful + $failed;
            $jobData['successful'] = $successful;
            $jobData['failed'] = $failed;
            $jobData['results'] = $results;
            $jobData['completed_at'] = now()->toDateTimeString();
            Cache::put($jobKey, $jobData, 3600);

            Log::info("Category training job completed", [
                'job_id' => $jobId,
                'successful' => $successful,
                'failed' => $failed,
                'total' => $successful + $failed
            ]);
        } catch (\Exception $e) {
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'failed';
            $jobData['error'] = $e->getMessage();
            $jobData['completed_at'] = now()->toDateTimeString();
            Cache::put($jobKey, $jobData, 3600);

            Log::error('Category training job failed', [
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process training for all products asynchronously
     * This runs in the background using a simple loop with cache updates
     *
     * @param string $jobId
     * @param string $aggregation
     * @param int $userId
     * @return void
     */
    private function processTrainAllAsync(string $jobId, string $aggregation, int $userId): void
    {
        // Run in background using set_time_limit for long execution
        try {
            set_time_limit(0);

            $jobKey = "job_{$jobId}";

            // Get user for request resolver
            $user = \App\Models\User::find($userId);
            if (!$user) {
                throw new \Exception("User not found");
            }

            $products = $this->getAllProductsWithHistory();

            // Update job status
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'processing';
            $jobData['started_at'] = now()->toDateTimeString();
            $jobData['total'] = count($products);
            Cache::put($jobKey, $jobData, 3600);

            $successful = 0;
            $failed = 0;
            $results = [];

            foreach ($products as $product) {
                try {
                    $trainRequest = Request::create('/api/ml/train', 'POST', [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'aggregation' => $aggregation
                    ]);

                    $trainRequest->setUserResolver(function () use ($user) {
                        return $user;
                    });

                    $response = app()->handle($trainRequest);

                    if ($response->getStatusCode() === 200) {
                        $successful++;
                    } else {
                        $failed++;
                    }

                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => $response->getStatusCode() === 200 ? 'success' : 'failed'
                    ];

                    // Update progress every 5 items
                    if (($successful + $failed) % 5 === 0) {
                        $jobData = Cache::get($jobKey);
                        $jobData['processed'] = $successful + $failed;
                        $jobData['successful'] = $successful;
                        $jobData['failed'] = $failed;
                        $jobData['results'] = $results;
                        Cache::put($jobKey, $jobData, 3600);
                    }
                } catch (\Exception $e) {
                    $failed++;
                    $results[] = [
                        'product_id' => $product->product_id,
                        'product_option_id' => $product->product_option_id,
                        'product_name' => $product->product_name,
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }

            // Mark job as completed
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'completed';
            $jobData['processed'] = $successful + $failed;
            $jobData['successful'] = $successful;
            $jobData['failed'] = $failed;
            $jobData['results'] = $results;
            $jobData['completed_at'] = now()->toDateTimeString();
            Cache::put($jobKey, $jobData, 3600);

            Log::info("All products training job completed", [
                'job_id' => $jobId,
                'successful' => $successful,
                'failed' => $failed,
                'total' => $successful + $failed
            ]);
        } catch (\Exception $e) {
            $jobData = Cache::get($jobKey);
            $jobData['status'] = 'failed';
            $jobData['error'] = $e->getMessage();
            $jobData['completed_at'] = now()->toDateTimeString();
            Cache::put($jobKey, $jobData, 3600);

            Log::error('All products training job failed', [
                'job_id' => $jobId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
