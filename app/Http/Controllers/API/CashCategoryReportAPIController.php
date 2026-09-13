<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\ClassifyCashPurposesJob;
use App\Models\CashExpenseCategory;
use App\Models\CashPurposeCategory;
use App\Models\CashRequisition;
use App\Services\CashPurposeClassifierService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashCategoryReportAPIController extends Controller
{
    protected CashPurposeClassifierService $classifier;

    public function __construct(CashPurposeClassifierService $classifier)
    {
        $this->classifier = $classifier;
    }

    /**
     * Propose a category taxonomy using the LLM (does not persist).
     */
    public function propose(Request $request): JsonResponse
    {
        $max = (int) ($request->max ?: 14);

        try {
            $categories = $this->classifier->proposeCategories($max);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Could not generate categories: ' . $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Approve (persist) a taxonomy. Classification only runs after this.
     */
    public function approve(Request $request): JsonResponse
    {
        $data = $request->validate([
            'categories' => 'required|array|min:1',
            'categories.*' => 'required|string|max:120',
        ]);

        $categories = $this->classifier->approveCategories($data['categories']);

        return response()->json([
            'categories' => $categories,
            'message' => 'Categories approved',
        ]);
    }

    /**
     * Dispatch classification of uncached purposes into approved categories.
     */
    public function classify(Request $request): JsonResponse
    {
        if (empty($this->classifier->approvedCategories())) {
            return response()->json([
                'message' => 'Please approve categories first.',
            ], 422);
        }

        ClassifyCashPurposesJob::dispatch((bool) $request->force);

        return response()->json([
            'dispatched' => true,
            'pending' => $this->classifier->pendingCount(),
        ]);
    }

    /**
     * Current state: approved categories + classification progress.
     */
    public function status(): JsonResponse
    {
        $total = count($this->classifier->distinctItems());
        $pending = $this->classifier->pendingCount();

        return response()->json([
            'categories' => $this->classifier->approvedCategories(),
            'total_items' => $total,
            'total_purposes' => $total,
            'pending' => $pending,
            'classified' => max(0, $total - $pending),
        ]);
    }

    /**
     * Category wise aggregation for approved cash requisitions in a period.
     */
    public function report(Request $request): JsonResponse
    {
        $items = $this->approvedItems($request);
        $purposeByRow = $this->classifier->resolveEffectivePurposes($items);
        $categoryMap = $this->categoryMap($items, $purposeByRow);
        $period = in_array($request->period, ['month', 'year']) ? $request->period : 'none';

        $rows = [];
        $total = 0;
        $uncategorized = 0;

        foreach ($items as $item) {
            $amount = (float) $item->required_unit * (float) $item->unit_price;
            $hash = $this->classifier->hashItem((string) $item->item);
            $category = $categoryMap[$hash] ?? 'Uncategorized';
            if ($category === 'Uncategorized') {
                $uncategorized += $amount;
            }
            $bucket = $this->bucket($item->ceo_approved_at, $period);
            $key = $category . '|' . $bucket;

            if (!isset($rows[$key])) {
                $rows[$key] = [
                    'category' => $category,
                    'period' => $bucket === '' ? null : $bucket,
                    'item_count' => 0,
                    'requisition_ids' => [],
                    'amount' => 0,
                ];
            }
            $rows[$key]['item_count']++;
            $rows[$key]['requisition_ids'][$item->requisition_id] = true;
            $rows[$key]['amount'] += $amount;
            $total += $amount;
        }

        $rows = array_values(array_map(function ($row) {
            $row['requisition_count'] = count($row['requisition_ids']);
            unset($row['requisition_ids']);

            return $row;
        }, $rows));

        usort($rows, fn ($a, $b) => strcmp($a['category'], $b['category']));

        return response()->json([
            'rows' => $rows,
            'total_amount' => round($total, 2),
            'uncategorized_amount' => round($uncategorized, 2),
            'start_date' => $this->first($request),
            'end_date' => $this->last($request),
            'period' => $period,
            'pending' => $this->classifier->pendingCount(),
        ]);
    }

    /**
     * Item level detail for one category (for the drill-down modal).
     */
    public function items(Request $request): JsonResponse
    {
        $category = (string) $request->category;
        $items = $this->approvedItems($request);
        $purposeByRow = $this->classifier->resolveEffectivePurposes($items);
        $categoryMap = $this->categoryMap($items, $purposeByRow);
        $period = in_array($request->period, ['month', 'year']) ? $request->period : 'none';

        $rows = [];
        foreach ($items as $item) {
            $purpose = $purposeByRow[$item->item_row_id] ?? (string) $item->purpose;
            $hash = $this->classifier->hashItem((string) $item->item);
            $cat = $categoryMap[$hash] ?? 'Uncategorized';
            if ($cat !== $category) {
                continue;
            }
            $amount = (float) $item->required_unit * (float) $item->unit_price;
            $bucket = $this->bucket($item->ceo_approved_at, $period);
            $key = $item->item . '|' . $purpose . '|' . $item->unit . '|' . $bucket;

            if (!isset($rows[$key])) {
                $rows[$key] = [
                    'item' => $item->item,
                    'unit' => $item->unit,
                    'purpose' => $purpose,
                    'period' => $bucket === '' ? null : $bucket,
                    'item_count' => 0,
                    'amount' => 0,
                ];
            }
            $rows[$key]['item_count']++;
            $rows[$key]['amount'] += $amount;
        }

        $rows = array_values($rows);
        usort($rows, fn ($a, $b) => strcmp((string) $a['item'], (string) $b['item']));

        return response()->json([
            'category' => $category,
            'rows' => $rows,
            'start_date' => $this->first($request),
            'end_date' => $this->last($request),
            'period' => $period,
        ]);
    }

    /**
     * Manually override a purpose's category.
     */
    public function override(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item' => 'required|string',
            'purpose' => 'nullable|string',
            'category' => 'required|string|max:120',
        ]);

        if (!in_array($data['category'], $this->classifier->approvedCategories(), true)) {
            return response()->json(['message' => 'Unknown category.'], 422);
        }

        $hash = $this->classifier->hashItem($data['item']);

        CashPurposeCategory::updateOrCreate(
            ['purpose_hash' => $hash],
            [
                'item' => $data['item'],
                'purpose' => $data['purpose'] ?? '',
                'category' => $data['category'],
                'is_manual' => true,
                'model' => 'manual',
                'classified_at' => now(),
            ]
        );

        return response()->json(['message' => 'Category updated.']);
    }

    /**
     * Exact vehicle fuel taken from vehicle_histories (linked to approved cash items),
     * with cash estimate reconciliation.
     */
    public function fuel(Request $request): JsonResponse
    {
        $rows = $this->linkedFuelRows($request);

        $byVehicle = [];
        $totals = ['quantity' => 0.0, 'cost' => 0.0, 'mileage' => 0.0, 'entries' => 0];
        $estimate = 0.0;
        $estimatedItems = [];

        foreach ($rows as $r) {
            $qty = (float) $r->quantity;
            $cost = $qty * (float) $r->rate;
            $mileage = (float) $r->current_mileage - (float) $r->last_mileage;

            $key = (string) ($r->vehicle_id ?? '0');
            if (!isset($byVehicle[$key])) {
                $name = trim(($r->brand ?? '') . ' (' . ($r->reg_no ?? '') . ')');
                $byVehicle[$key] = [
                    'vehicle_id' => $r->vehicle_id,
                    'vehicle' => $name !== '' && $name !== '()' ? $name : 'N/A',
                    'entries' => 0,
                    'quantity' => 0.0,
                    'cost' => 0.0,
                    'mileage' => 0.0,
                ];
            }
            $byVehicle[$key]['entries']++;
            $byVehicle[$key]['quantity'] += $qty;
            $byVehicle[$key]['cost'] += $cost;
            $byVehicle[$key]['mileage'] += $mileage;

            $totals['quantity'] += $qty;
            $totals['cost'] += $cost;
            $totals['mileage'] += $mileage;
            $totals['entries']++;

            if (!isset($estimatedItems[$r->item_id])) {
                $estimatedItems[$r->item_id] = true;
                $estimate += (float) $r->required_unit * (float) $r->unit_price;
            }
        }

        $rows = array_values(array_map(function ($v) {
            $v['quantity'] = round($v['quantity'], 2);
            $v['cost'] = round($v['cost'], 2);
            $v['mileage'] = round($v['mileage'], 2);
            $v['average_rate'] = $v['quantity'] > 0 ? round($v['cost'] / $v['quantity'], 2) : 0;

            return $v;
        }, $byVehicle));

        usort($rows, fn ($a, $b) => strcmp($a['vehicle'], $b['vehicle']));

        $totalPayload = [
            'quantity' => round($totals['quantity'], 2),
            'cost' => round($totals['cost'], 2),
            'mileage' => round($totals['mileage'], 2),
            'entries' => $totals['entries'],
            'average_rate' => $totals['quantity'] > 0 ? round($totals['cost'] / $totals['quantity'], 2) : 0,
        ];

        return response()->json([
            'rows' => $rows,
            'totals' => $totalPayload,
            'cash_estimate' => round($estimate, 2),
            'variance' => round($estimate - $totals['cost'], 2),
            'start_date' => $this->first($request),
            'end_date' => $this->last($request),
        ]);
    }

    /**
     * Per refuel detail for the vehicle fuel (actual) drill-down.
     */
    public function fuelItems(Request $request): JsonResponse
    {
        $rows = $this->linkedFuelRows($request);

        $items = $rows->map(function ($r) {
            $name = trim(($r->brand ?? '') . ' (' . ($r->reg_no ?? '') . ')');

            return [
                'vehicle' => $name !== '' && $name !== '()' ? $name : 'N/A',
                'refuel_date' => $r->refuel_date ? Carbon::parse($r->refuel_date)->toDateString() : null,
                'item' => $r->item,
                'purpose' => $r->purpose,
                'quantity' => round((float) $r->quantity, 2),
                'rate' => round((float) $r->rate, 2),
                'cost' => round((float) $r->quantity * (float) $r->rate, 2),
                'mileage' => round((float) $r->current_mileage - (float) $r->last_mileage, 2),
                'bill_no' => $r->bill_no,
            ];
        })->sortBy([['vehicle', 'asc'], ['refuel_date', 'asc']])->values();

        return response()->json([
            'rows' => $items,
            'start_date' => $this->first($request),
            'end_date' => $this->last($request),
        ]);
    }

    /**
     * Base collection of vehicle_histories linked to approved cash requisition items.
     */
    protected function linkedFuelRows(Request $request)
    {
        $first = $this->first($request);
        $last = $this->last($request);
        $branchId = auth_branch_id();

        $latestCashStatus = DB::table('requisition_statuses')
            ->selectRaw('MAX(id) as id')
            ->where('requisition_type', CashRequisition::class)
            ->whereNull('deleted_at')
            ->groupBy('requisition_id');

        return DB::table('vehicle_histories as vh')
            ->join('cash_requisition_items as i', 'vh.cash_requisition_item_id', '=', 'i.id')
            ->join('cash_requisitions as cr', 'i.cash_requisition_id', '=', 'cr.id')
            ->join('requisition_statuses as rs', 'rs.requisition_id', '=', 'cr.id')
            ->joinSub($latestCashStatus, 'ls', 'ls.id', '=', 'rs.id')
            ->leftJoin('vehicles as v', 'v.id', '=', 'vh.vehicle_id')
            ->where('rs.requisition_type', CashRequisition::class)
            ->where('rs.ceo_status', 2)
            ->whereNotNull('rs.ceo_approved_at')
            ->whereNull('rs.deleted_at')
            ->whereBetween('rs.ceo_approved_at', [$first, $last])
            ->where('cr.branch_id', $branchId)
            ->whereNull('cr.deleted_at')
            ->whereNull('i.deleted_at')
            ->whereNull('vh.deleted_at')
            ->when($request->department_id, fn ($q, $v) => $q->where('cr.department_id', $v))
            ->select([
                'vh.id as history_id',
                'vh.vehicle_id',
                'vh.refuel_date',
                'vh.quantity',
                'vh.rate',
                'vh.bill_no',
                'vh.current_mileage',
                'vh.last_mileage',
                'i.id as item_id',
                'i.item',
                'i.purpose',
                'i.required_unit',
                'i.unit_price',
                'v.brand',
                'v.reg_no',
            ])
            ->get();
    }

    /**
     * Approved cash requisition item rows in the requested period.
     */
    protected function approvedItems(Request $request)
    {
        $first = $this->first($request);
        $last = $this->last($request);
        $branchId = auth_branch_id();

        $latestCashStatus = DB::table('requisition_statuses')
            ->selectRaw('MAX(id) as id')
            ->where('requisition_type', CashRequisition::class)
            ->whereNull('deleted_at')
            ->groupBy('requisition_id');

        return DB::table('cash_requisition_items as i')
            ->join('cash_requisitions as cr', 'i.cash_requisition_id', '=', 'cr.id')
            ->join('requisition_statuses as rs', 'rs.requisition_id', '=', 'cr.id')
            ->joinSub($latestCashStatus, 'ls', 'ls.id', '=', 'rs.id')
            ->where('rs.requisition_type', CashRequisition::class)
            ->where('rs.ceo_status', 2)
            ->whereNotNull('rs.ceo_approved_at')
            ->whereNull('rs.deleted_at')
            ->whereBetween('rs.ceo_approved_at', [$first, $last])
            ->where('cr.branch_id', $branchId)
            ->whereNull('cr.deleted_at')
            ->whereNull('i.deleted_at')
            ->when($request->department_id, fn ($q, $v) => $q->where('cr.department_id', $v))
            ->select([
                'i.id as item_row_id',
                'i.cash_requisition_id',
                'i.item',
                'i.unit',
                'i.purpose',
                'i.required_unit',
                'i.unit_price',
                'cr.id as requisition_id',
                'cr.department_id',
                'rs.ceo_approved_at',
            ])
            ->orderBy('i.cash_requisition_id')
            ->orderBy('i.id')
            ->get();
    }

    /**
     * Map of purpose_hash => category for the given purposes (uncategorized => null).
     */
    protected function categoryMap($items, array $purposeByRow = []): array
    {
        $hashes = collect($items)
            ->map(fn ($r) => $this->classifier->hashItem((string) $r->item))
            ->unique()
            ->values()
            ->all();

        if (empty($hashes)) {
            return [];
        }

        return CashPurposeCategory::query()
            ->whereIn('purpose_hash', $hashes)
            ->whereNotNull('category')
            ->pluck('category', 'purpose_hash')
            ->all();
    }

    protected function bucket($date, string $period): string
    {
        if (!$date) {
            return '';
        }
        $carbon = Carbon::parse($date);
        if ($period === 'month') {
            return $carbon->format('Y-m');
        }
        if ($period === 'year') {
            return $carbon->format('Y');
        }

        return '';
    }

    protected function first(Request $request): string
    {
        return $request->start_date
            ? Carbon::parse($request->start_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->firstOfMonth()->toDateString();
    }

    protected function last(Request $request): string
    {
        return $request->end_date
            ? Carbon::parse($request->end_date)->toDateString()
            : Carbon::now()->subMonthNoOverflow()->lastOfMonth()->toDateString();
    }
}
