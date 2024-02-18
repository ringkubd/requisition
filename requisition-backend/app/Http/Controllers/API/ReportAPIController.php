<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductBalanceResource;
use App\Http\Resources\ProductIssueItemReportResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\PurchaseResource;
use App\Models\Product;
use App\Models\ProductIssueItems;
use App\Models\ProductOption;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportAPIController extends AppBaseController
{
    public function generalReport(Request $request){
        $products = Product::query()
            ->when($request->category, function ($q, $c){
                $q->where('category_id', $q);
            })
            ->with(['productOptions' => function($q) use($request) {
                $q->when('');
            }])
        ;
    }

    public function dailyReport(Request $request){
        $today = Carbon::today()->toDateString();
        $products = Product::query()
            ->with(['issues' => function ($q) use($request, $today) {
                $q->when($request->date, function ($q, $d){
                    $q->whereRaw("date(issue_time) = '$d'");
                }, function ($q) use ($today){
                    $q->whereRaw("date(issue_time) = '$today'");
                });
            }])
            ->with(['purchaseHistory' => function ($q) use($request, $today) {
                $q->when($request->date, function ($q, $d){
                    $q->whereRaw("date(purchase_date) = '$d'");
                }, function ($q) use ($today){
                    $q->whereRaw("date(purchase_date) = '$today'");
                });
            }])
            ->whereHas('issues' , function ($q) use($request, $today) {
                $q->when($request->date, function ($q, $d){
                    $q->whereRaw("date(issue_time) = '$d'");
                }, function ($q) use ($today){
                    $q->whereRaw("date(issue_time) = '$today'");
                });
            })
            ->orWhereHas('purchaseHistory', function ($q) use($request, $today) {
                $q->when($request->date, function ($q, $d){
                    $q->whereRaw("date(purchase_date) = '$d'");
                }, function ($q) use ($today){
                    $q->whereRaw("date(purchase_date) = '$today'");
                });
            })
            ->get();
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function issueReport(Request $request): JsonResponse
    {
        $categories = explode(',',$request->category);
        $products = explode(',',$request->product);
        $first = $request->start_date ?? Carbon::now()->subMonth(1)->firstOfMonth()->toDateString();
        $last = $request->end_date ?? Carbon::now()->subMonth(1)->lastOfMonth()->toDateString();
        $report_format = $request->report_format;

        $issues = ProductIssueItemReportResource::collection(ProductIssueItems::query()
            ->when(!empty($request->category), function ($q) use ($categories){
                $q->whereHas('product', function ($query) use ($categories){
                    $query->whereIn('category_id', $categories)->orWhereIn('use_in_category', $categories);
                });
            })
            ->when(!empty($request->product), function ($q) use ($products){
                $q->whereIn('product_id', $products);
            })
            ->when($request->department, function ($q, $v){
                $q->whereHas('productIssue', function ($q) use ($v){
                    $q->where('issuer_department_id', $v);
                });
            })
            ->whereHas('productIssue', function ($q) use($first, $last){
                $q->whereRaw("date(issue_time) between '$first' and '$last'")
                    ->where('store_status', 1);
            })

            ->latest('updated_at')
            ->get());
        return  response()->json([
            'issues' => $report_format === "category_base" ? $issues->collection->groupBy('category.title') : $issues->collection->groupBy('product.title'),
            'start_date' => $first,
            'end_date' => $last
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function purchaseReport(Request $request): JsonResponse
    {
        $categories = explode(',',$request->category);
        $products = explode(',',$request->product);
        $first = $request->start_date ?? Carbon::now()->subMonth(1)->firstOfMonth()->toDateString();
        $last = $request->end_date ?? Carbon::now()->subMonth(1)->lastOfMonth()->toDateString();
        $report_format = $request->report_format;

        $purchase = PurchaseResource::collection(Purchase::query()
            ->when(!empty($request->category), function ($q) use ($categories){
                $q->whereHas('product', function ($query) use ($categories){
                    $query->whereIn('category_id', $categories);
                });
            })
            ->when(!empty($request->product), function ($q) use ($products){
                $q->whereIn('product_id', $products);
            })
            ->when($request->department, function ($q, $v){
                $q->whereHas('purchaseRequisition', function ($q) use ($v){
                    $q->where('department_id', $v);
                });
            })
            ->whereBetween('purchase_date', ["$first", "$last"])
            ->latest()
            ->get());
        return response()->json([
            'purchase' =>  $report_format === "category_base" ? $purchase : $purchase->collection->groupBy('product.title'),
            'start_date' => $first,
            'end_date' => $last
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function bothReport(Request $request) : JsonResponse
    {
        $categories = explode(',',$request->category);
        $products = explode(',',$request->product);
        $first = $request->start_date ?? Carbon::now()->subMonth(1)->firstOfMonth()->toDateString();
        $last = $request->end_date ?? Carbon::now()->subMonth(1)->lastOfMonth()->toDateString();
        $report_format = $request->report_format;

        $product_report = ProductResource::collection(Product::query()
            ->when(!empty($request->category), function ($q) use ($categories){
                $q->whereIn('category_id', $categories);
            })
            ->when($request->product, function ($q) use ($products){
                $q->whereIn('id', $products);
            })
            ->where(function ($q) use ($first, $last){
                $q
                    ->whereHas('productOptions.purchaseHistory', function ($s) use ($first, $last){
                        $s->whereBetween('purchase_date',  ["$first", "$last"]);
                    })
                    ->orWhereHas('productOptions.productApprovedIssue', function ($s) use ($first, $last){
                        $s->whereHas('productIssue', function ($q) use ($first, $last) {
                            $q->whereBetween('store_approved_at',  ["$first", "$last"]);
                        })->latest();
                    })
                ;
            })
            ->with(['productOptions.purchaseHistory' => function ($q) use ($first, $last) {
                $q->whereBetween('purchase_date',  ["$first", "$last"]);
            }])
            ->with(['productOptions.productApprovedIssue' => function ($q) use ($first, $last) {
                $q->whereBetween('use_date',  ["$first", "$last"]);
            }])
            ->get());
        return response()->json([
            'both' => $product_report->collection->groupBy('title'),
            'start_date' => $first,
            'end_date' => $last
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function currentBalance(Request $request): JsonResponse
    {
        $categories = explode(',',$request->category);
        $products = explode(',',$request->product);
        $department = $request->department;
        $report_type = $request->report_type;
        $first = $request->start_date ?? Carbon::now()->toDateString();
        $last = $request->end_date ?? Carbon::now()->toDateString();

        $product_options = ProductOption::query()
            ->when($request->category, function ($q) use($categories){
                $q->whereHas('product', function ($b) use ($categories){
                    $b->whereIn('category_id', $categories);
                });
            })
            ->when($request->product, function ($q) use($products){
                $q->whereHas('product', function ($b) use ($products){
                    $b->whereIn('id', $products);
                });
            })
            ->whereHas('product')
            ->get();

        $report = [];
        foreach ($product_options as $po){
            $lastPurchase = $po->purchaseHistory->where('purchase_date', '<=', $first)->first();
            $lastIssue = $po->productApprovedIssue->filter(function ($q) use ($first){
                return $q->productIssue?->store_approved_at && Carbon::parse($first)->endOfDay()->greaterThanOrEqualTo($q->productIssue?->store_approved_at);
            })->first();

            if ($lastPurchase && !$lastIssue){
                $stock = $lastPurchase->oldBalance + $lastPurchase->qty;
            }elseif (!$lastPurchase && $lastIssue){
                $stock = $lastIssue->balance_after_issue;
            }elseif ($lastPurchase && $lastIssue){
                $stock = $lastPurchase->purchase_date > $lastIssue->productIssue?->store_approved_at ? $lastPurchase->old_balance + $lastPurchase->qty : $lastIssue->balance_after_issue;
            }else{
                $stock = $po->stock + $po->purchaseHistory->sum('qty') - $po->productApprovedIssue->filter(function ($q) use ($first){
                        return $q->productIssue?->store_approved_at;
                    })->sum('quantity');
            }
            $report[$po->product_id]['time_stock'] = array_key_exists($po->product_id, $report) &&  array_key_exists('time_stock',$report[$po->product_id])?  $stock + $report[$po->product_id]['time_stock'] : $stock;
            $report[$po->product_id]['current_stock'] =  array_key_exists($po->product_id, $report) &&  array_key_exists('current_stock',$report[$po->product_id])?  $po->stock + $report[$po->product_id]['current_stock'] : $po->stock;;
            $report[$po->product_id]['title'] =  $po->product?->title;
            $report[$po->product_id]['unit'] =  $po->product?->unit;
            $report[$po->product_id]['category'] =  $po->product?->category?->title;
        }
        return response()->json([
            'start_date' => $first,
            'end_date' => $last,
            'report' => collect($report)->toArray()
        ]);
    }
}
