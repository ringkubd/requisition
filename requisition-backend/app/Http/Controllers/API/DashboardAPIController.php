<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use App\Http\Resources\InitialRequisitionResource;
use App\Models\CashRequisition;
use App\Models\InitialRequisition;
use Illuminate\Http\Request;

class DashboardAPIController extends AppBaseController
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $initialRequisition =InitialRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->when(!$request->user()->hasRole('CEO'), function ($query) use($request){
                $query->whereHas('department', function ($department)use ($request){
                    $department->when($request->department_id, function ($q, $d){
                        $q->where('id', $d);
                    }, function ($q){
                        $q->where('id', auth_department_id());
                    });
                });
            }, function ($query) use($request){
                $query->whereHas('approval_status', function ($q){
                    $q->where('ceo_status', '!=', 0);
                });
            })
            ->latest()
            ->paginate(\request()->per_page ?? 15);
        return response()->json([
            'initial' =>  InitialRequisitionResource::collection($initialRequisition),
            "number_of_rows" => $initialRequisition->total(),
        ]);
    }
    public function cash(Request $request): \Illuminate\Http\JsonResponse
    {
        $cashRequisition = CashRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->whereHas('department', function ($department)use ($request){
                $department->when($request->department_id, function ($q, $d){
                    $q->where('id', $d);
                }, function ($q){
                    $q->where('id', auth_department_id());
                });
            })
            ->latest()
            ->paginate(\request()->per_page ?? 15);
        return response()->json([
            'cash' =>  CashRequisitionResource::collection($cashRequisition),
            "number_of_rows" => $cashRequisition->total(),
        ]);
    }
}
