<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\CashRequisitionResource;
use App\Http\Resources\InitialRequisitionResource;
use App\Http\Resources\PurchaseRequisitionResource;
use App\Models\CashRequisition;
use App\Models\InitialRequisition;
use App\Models\PurchaseRequisition;
use Illuminate\Http\Request;

class DashboardAPIController extends AppBaseController
{
    public function index(): \Illuminate\Http\JsonResponse
    {
        $initialRequisition = InitialRequisitionResource::collection(InitialRequisition::where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->limit(10)
            ->latest()
            ->get()
        );
        $purchaseRequisition = PurchaseRequisitionResource::collection(PurchaseRequisition::where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->limit(15)
            ->latest()
            ->get()
        );
        $cashRequisition = CashRequisitionResource::collection(CashRequisition::where('department_id', auth_department_id())
            ->where('branch_id', auth_branch_id())
            ->limit(15)
            ->latest()
            ->get()
        );
        return response()->json([
            'initial' => $initialRequisition,
            'purchase' => $purchaseRequisition,
            'cash' => $cashRequisition,
        ]);
    }
}
