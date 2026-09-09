<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CashRequisition;
use App\Models\Category;
use App\Models\Department;
use App\Models\PurchaseRequisition;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SummaryReportAPIController extends Controller
{
    /**
     * Department & category wise summary report:
     * requisition approved (CEO) vs actual purchase vs actual used.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function departmentCategory(Request $request): JsonResponse
    {
        $first = $request->start_date
            ? Carbon::parse($request->start_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->firstOfMonth()->toDateString();

        $last = $request->end_date
            ? Carbon::parse($request->end_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->lastOfMonth()->toDateString();

        $period = in_array($request->period, ['month', 'year']) ? $request->period : 'none';
        $branchId = auth_branch_id();

        // One (latest) status row per requisition to avoid double counting
        $latestPrStatus = DB::table('requisition_statuses')
            ->selectRaw('MAX(id) as id')
            ->where('requisition_type', PurchaseRequisition::class)
            ->whereNull('deleted_at')
            ->groupBy('requisition_id');

        $latestCashStatus = DB::table('requisition_statuses')
            ->selectRaw('MAX(id) as id')
            ->where('requisition_type', CashRequisition::class)
            ->whereNull('deleted_at')
            ->groupBy('requisition_id');

        $reqPeriodExpr = $this->periodExpression('rs.ceo_approved_at', $period);
        $purPeriodExpr = $this->periodExpression('pu.purchase_date', $period);
        $usePeriodExpr = $this->periodExpression('pii.use_date', $period);

        // 1) Requisition approved (CEO approved purchase requisition lines)
        $requisitionApproved = DB::table('purchase_requisition_products as prp')
            ->join('purchase_requisitions as pr', 'prp.purchase_requisition_id', '=', 'pr.id')
            ->join('requisition_statuses as rs', function ($j) use ($first, $last) {
                $j->on('rs.requisition_id', '=', 'pr.id')
                    ->where('rs.requisition_type', PurchaseRequisition::class)
                    ->where('rs.ceo_status', 2)
                    ->whereNotNull('rs.ceo_approved_at')
                    ->whereNull('rs.deleted_at')
                    ->whereBetween('rs.ceo_approved_at', [$first, $last]);
            })
            ->whereIn('rs.id', $latestPrStatus)
            ->leftJoin('products as p', 'p.id', '=', 'prp.product_id')
            ->where('pr.branch_id', $branchId)
            ->whereNull('pr.deleted_at')
            ->whereNull('prp.deleted_at')
            ->when($request->department_id, fn ($q, $v) => $q->where('pr.department_id', $v))
            ->when($request->category_id, fn ($q, $v) => $q->where('p.category_id', $v))
            ->selectRaw("pr.department_id as department_id, p.category_id as category_id, {$reqPeriodExpr} as period, SUM(prp.required_quantity * prp.unit_price) as amount")
            ->when($period !== 'none', fn ($q) => $q->groupBy(DB::raw('pr.department_id, p.category_id, ' . $reqPeriodExpr)), fn ($q) => $q->groupBy(DB::raw('pr.department_id, p.category_id')))
            ->get();

        // 2) Actual purchase
        $actualPurchase = DB::table('purchases as pu')
            ->join('purchase_requisitions as pr', 'pu.purchase_requisition_id', '=', 'pr.id')
            ->leftJoin('products as p', 'p.id', '=', 'pu.product_id')
            ->where('pr.branch_id', $branchId)
            ->whereNull('pu.deleted_at')
            ->whereNull('pr.deleted_at')
            ->whereBetween('pu.purchase_date', [$first, $last])
            ->when($request->department_id, fn ($q, $v) => $q->where('pr.department_id', $v))
            ->when($request->category_id, fn ($q, $v) => $q->where('p.category_id', $v))
            ->selectRaw("pr.department_id as department_id, p.category_id as category_id, {$purPeriodExpr} as period, SUM(pu.total_price) as amount")
            ->when($period !== 'none', fn ($q) => $q->groupBy(DB::raw('pr.department_id, p.category_id, ' . $purPeriodExpr)), fn ($q) => $q->groupBy(DB::raw('pr.department_id, p.category_id')))
            ->get();

        // 3) Actual used (store approved issues, FIFO consumed value)
        $actualUsed = DB::table('issue_purchase_logs as ipl')
            ->join('product_issue_items as pii', 'ipl.product_issue_items_id', '=', 'pii.id')
            ->join('product_issues as pi', 'pii.product_issue_id', '=', 'pi.id')
            ->leftJoin('products as p', 'p.id', '=', 'pii.product_id')
            ->where('pi.store_status', 1)
            ->where('pi.issuer_branch_id', $branchId)
            ->whereNull('pi.deleted_at')
            ->whereNull('pii.deleted_at')
            ->whereNull('ipl.deleted_at')
            ->whereBetween('pii.use_date', [$first, $last])
            ->when($request->department_id, fn ($q, $v) => $q->where('pi.issuer_department_id', $v))
            ->when($request->category_id, fn ($q, $v) => $q->whereRaw('COALESCE(pii.use_in_category, p.category_id) = ?', [$v]))
            ->selectRaw("pi.issuer_department_id as department_id, COALESCE(pii.use_in_category, p.category_id) as category_id, {$usePeriodExpr} as period, SUM(ipl.total_price) as amount")
            ->when($period !== 'none', fn ($q) => $q->groupBy(DB::raw('pi.issuer_department_id, COALESCE(pii.use_in_category, p.category_id), ' . $usePeriodExpr)), fn ($q) => $q->groupBy(DB::raw('pi.issuer_department_id, COALESCE(pii.use_in_category, p.category_id)')))
            ->get();

        $rows = [];
        $merge = function ($items, string $amountKey) use (&$rows) {
            foreach ($items as $item) {
                $key = ($item->department_id ?? 0) . '|' . ($item->category_id ?? 0) . '|' . ($item->period ?? '');
                if (!isset($rows[$key])) {
                    $rows[$key] = [
                        'department_id' => $item->department_id,
                        'department_name' => null,
                        'category_id' => $item->category_id,
                        'category_title' => null,
                        'period' => $item->period,
                        'requisition_amount' => 0,
                        'purchase_amount' => 0,
                        'used_amount' => 0,
                    ];
                }
                $rows[$key][$amountKey] = round($rows[$key][$amountKey] + $item->amount, 2);
            }
        };

        $merge($requisitionApproved, 'requisition_amount');
        $merge($actualPurchase, 'purchase_amount');
        $merge($actualUsed, 'used_amount');

        $departmentIds = collect($rows)->pluck('department_id')->filter()->unique()->values();
        $categoryIds = collect($rows)->pluck('category_id')->filter()->unique()->values();

        $departments = $departmentIds->isEmpty()
            ? collect()
            : Department::withTrashed()->whereIn('id', $departmentIds)->pluck('name', 'id');
        $categories = $categoryIds->isEmpty()
            ? collect()
            : Category::withTrashed()->whereIn('id', $categoryIds)->pluck('title', 'id');

        $rows = array_map(function ($row) use ($departments, $categories) {
            $row['department_name'] = $row['department_id'] ? ($departments[$row['department_id']] ?? 'N/A') : 'N/A';
            $row['category_title'] = $row['category_id'] ? ($categories[$row['category_id']] ?? 'N/A') : 'N/A';
            $row['total_amount'] = round($row['purchase_amount'] + $row['used_amount'], 2);

            return $row;
        }, array_values($rows));

        return response()->json([
            'rows' => $rows,
            'start_date' => $first,
            'end_date' => $last,
            'period' => $period,
        ]);
    }

    /**
     * Department wise cash requisition summary (CEO approved requisitions).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function cash(Request $request): JsonResponse
    {
        $first = $request->start_date
            ? Carbon::parse($request->start_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->firstOfMonth()->toDateString();

        $last = $request->end_date
            ? Carbon::parse($request->end_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->lastOfMonth()->toDateString();

        $period = in_array($request->period, ['month', 'year']) ? $request->period : 'none';
        $branchId = auth_branch_id();

        $latestCashStatus = DB::table('requisition_statuses')
            ->selectRaw('MAX(id) as id')
            ->where('requisition_type', CashRequisition::class)
            ->whereNull('deleted_at')
            ->groupBy('requisition_id');

        $cashPeriodExpr = $this->periodExpression('rs.ceo_approved_at', $period);

        $rows = DB::table('cash_requisitions as cr')
            ->join('requisition_statuses as rs', 'rs.requisition_id', '=', 'cr.id')
            ->joinSub($latestCashStatus, 'ls', 'ls.id', '=', 'rs.id')
            ->where('rs.requisition_type', CashRequisition::class)
            ->where('rs.ceo_status', 2)
            ->whereNotNull('rs.ceo_approved_at')
            ->whereNull('rs.deleted_at')
            ->whereBetween('rs.ceo_approved_at', [$first, $last])
            ->where('cr.branch_id', $branchId)
            ->whereNull('cr.deleted_at')
            ->when($request->department_id, fn ($q, $v) => $q->where('cr.department_id', $v))
            ->selectRaw("cr.department_id as department_id, {$cashPeriodExpr} as period, COUNT(DISTINCT cr.id) as requisition_count, SUM(cr.total_cost) as amount")
            ->when($period !== 'none', fn ($q) => $q->groupBy(DB::raw('cr.department_id, ' . $cashPeriodExpr)), fn ($q) => $q->groupBy(DB::raw('cr.department_id')))
            ->get()
            ->map(function ($row) {
                $row->requisition_count = (int) $row->requisition_count;
                $row->amount = round($row->amount, 2);

                return $row;
            });

        $departmentIds = $rows->pluck('department_id')->filter()->unique()->values();
        $departments = $departmentIds->isEmpty()
            ? collect()
            : Department::withTrashed()->whereIn('id', $departmentIds)->pluck('name', 'id');

        $rows = $rows->map(function ($row) use ($departments) {
            $row->department_name = $row->department_id ? ($departments[$row->department_id] ?? 'N/A') : 'N/A';

            return $row;
        })->values();

        return response()->json([
            'rows' => $rows,
            'start_date' => $first,
            'end_date' => $last,
            'period' => $period,
        ]);
    }

    /**
     * SQL expression for period bucketing.
     */
    private function periodExpression(string $column, string $period): string
    {
        if ($period === 'month') {
            return "DATE_FORMAT({$column}, '%Y-%m')";
        }
        if ($period === 'year') {
            return "DATE_FORMAT({$column}, '%Y')";
        }

        return 'NULL';
    }
}
