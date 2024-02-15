<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductBalanceResource;
use App\Http\Resources\ProductIssueItemReportResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\PurchaseResource;
use App\Models\Product;
use App\Models\ProductIssueItems;
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
            ->when(!empty($request->product), function ($q) use ($products){
                $q->whereIn('id', $products);
            })
            ->where(function ($q) use ($first, $last){
                $q
                    ->whereHas('productOptions.purchaseHistory', function ($s) use ($first, $last){
                        $s->whereBetween('purchase_date',  ["$first", "$last"]);
                    })
                    ->orWhereHas('productOptions.productIssue', function ($s) use ($first, $last){
                        $s->whereBetween('use_date',  ["$first", "$last"]);
                    })
                ;
            })
            ->with(['productOptions.purchaseHistory' => function ($q) use ($first, $last) {
                $q->whereBetween('purchase_date',  ["$first", "$last"]);
            }])
            ->with(['productOptions.productIssue' => function ($q) use ($first, $last) {
                $q->whereBetween('use_date',  ["$first", "$last"]);
            }])
            ->get());
        return response()->json([
            'both' =>  $report_format === "category_base" ? $product_report->collection->groupBy('category.title') : $product_report->collection->groupBy('title'),
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

        $product = Product::query()
            ->when($request->category, function ($q) use($categories){
                $q->whereIn('category_id', $categories);
            })
            ->when($request->product, function ($q) use($products){
                $q->whereIn('id', $products);
            })
            ->with(['productOptions.productApprovedIssue' => function ($r) use ($first){
                $r->whereHas('productIssue', function ($s) use ($first){
                    $s->where('store_status', 1)->whereRaw("date(store_approved_at) <= '$first'");
                })->latest()->first();
            }])
            ->get();
        return response()->json([
            'balance' =>  ProductBalanceResource::collection($product),
            'start_date' => $first,
            'end_date' => $last
        ]);
    }
}
