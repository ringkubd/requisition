<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use App\Http\Resources\InitialRequisitionResource;
use App\Models\CashRequisition;
use App\Models\InitialRequisition;

class DashboardAPIController extends AppBaseController
{
    public function index(): \Illuminate\Http\JsonResponse
    {
        $initialRequisition =InitialRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->paginate(\request()->per_page ?? 15);
        return response()->json([
            'initial' =>  InitialRequisitionResource::collection($initialRequisition),
            "number_of_rows" => $initialRequisition->total(),
        ]);
    }
    public function cash(): \Illuminate\Http\JsonResponse
    {
        $cashRequisition = CashRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->latest()
            ->paginate(\request()->per_page ?? 15);
        return response()->json([
            'cash' =>  CashRequisitionResource::collection($cashRequisition),
            "number_of_rows" => $cashRequisition->total(),
        ]);
    }
}
