<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
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

            // Format data for ML service
            $trainingData = [];
            foreach ($timeSeries as $point) {
                if ($point['purchase_qty'] > 0 || $point['issue_qty'] > 0) {
                    $trainingData[] = [
                        'date' => $point['date'],
                        'quantity' => $point['issue_qty'], // Use issue quantity for usage forecasting
                        'value' => $point['purchase_value']
                    ];
                }
            }

            if (count($trainingData) < 10) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient data for training. Need at least 10 data points. Found: ' . count($trainingData)
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
}
