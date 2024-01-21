<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueItemReportResource;
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

            ->latest()
            ->get());
        return  response()->json([
            'issues' => $issues->collection->groupBy('category.title'),
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
            'purchase' => $purchase,
            'start_date' => $first,
            'end_date' => $last
        ]);
    }
}
