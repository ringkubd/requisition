<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ProductIssueResource;
use App\Models\Product;
use App\Models\ProductIssue;
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
        $last = $request->end_date;
        $first = $request->start_date;

        $issues = ProductIssueResource::collection(ProductIssue::query()
            ->when(!empty($request->category), function ($q) use ($categories){
                $q->whereHas('product', function ($query) use ($categories){
                    $query->whereIn('category_id', $categories);
                })->orWhereIn('use_in_category', $categories);
            })
            ->when(!empty($request->product), function ($q) use ($products){
                $q->whereIn('product_id', $products);
            })
            ->when($request->department, function ($q, $v){
                $q->where('issuer_department_id', $v);
            })
            ->whereRaw("date(issue_time) between '$first' and '$last'")
            ->latest()
            ->get());
        return  response()->json($issues->collection->groupBy('category.title'));
        return $this->sendResponse($issues->collection->groupBy('category_title'),   __('messages.report', ['model' => __('models/products.singular')]));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */

    public function purchaseReport(Request $request): JsonResponse
    {
        $categories = explode(',',$request->category);
        $products = explode(',',$request->product);
        $last = $request->end_date;
        $first = $request->start_date;

        $purchase = Purchase::query()
            ->when(!empty($request->category), function ($q) use ($categories){
                $q->whereHas('product', function ($query) use ($categories){
                    $query->whereIn('category_id', $categories);
                });
            })
            ->when(!empty($request->product), function ($q) use ($products){
                $q->whereIn('product_id', $products);
            })
            ->whereBetween('purchase_date', [$first, $last])
            ->latest()
            ->get();
        return $this->sendResponse($purchase,   __('messages.report', ['model' => __('models/products.singular')]));
    }
}
