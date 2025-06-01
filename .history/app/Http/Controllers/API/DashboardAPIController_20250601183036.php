<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\CashRequisitionResource;
use App\Http\Resources\DashboardRequisitionResource;
use App\Http\Resources\InitialRequisitionResource;
use App\Models\CashRequisition;
use App\Models\InitialRequisition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAPIController extends AppBaseController
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $initialRequisition = InitialRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->when($request->user()?->hasRole('CEO') || $request->user()?->hasRole('Accounts'), function ($query) use ($request) {
                if ($request->user()?->hasRole('CEO')) {
                    $query->whereHas('approval_status', function ($q) {
                        $q->where('ceo_status', '!=', 0);
                    });
                }
                if ($request->user()?->hasRole('Accounts')) {
                    $query->whereHas('approval_status', function ($q) {
                        $q->where('accounts_status', '!=', 0);
                    });
                }
            }, function ($query) use ($request) {
                $query->whereHas('department', function ($department) use ($request) {
                    $department->when($request->department_id, function ($q, $d) {
                        $q->where('id', $d);
                    }, function ($q) {
                        $q->where('id', auth_department_id());
                    });
                });
            })
            ->latest()
            ->paginate(\request()->per_page ?? 15);
        $collections = DashboardRequisitionResource::collection($initialRequisition);
        return response()->json([
            'initial' =>  $collections,
            "number_of_rows" => $initialRequisition->total(),
            'role' => $request->user()?->hasRole('Accounts'),
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function cash(Request $request): JsonResponse
    {
        $cashRequisition = CashRequisition::query()
            ->where('branch_id', auth_branch_id())
            ->when($request->user()?->hasRole('CEO') || $request->user()?->hasRole('Accounts'), function ($query) use ($request) {
                if ($request->user()?->hasRole('CEO')) {
                    $query->whereHas('approval_status', function ($q) {
                        $q->where('ceo_status', '!=', 0);
                    });
                }
                if ($request->user()->hasRole('Accounts')) {
                    $query->whereHas('approval_status', function ($q) {
                        $q->where('accounts_status', '!=', 0);
                    });
                }
            }, function ($query) use ($request) {
                $query->whereHas('department', function ($department) use ($request) {
                    $department->when($request->department_id, function ($q, $d) {
                        $q->where('id', $d);
                    }, function ($q) {
                        $q->where('id', auth_department_id());
                    });
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
