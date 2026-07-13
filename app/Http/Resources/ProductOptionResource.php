<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductOptionResource extends JsonResource
{
    private static array $memo = [];

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $id = $this->id;

        if (!isset(self::$memo[$id])) {
            self::$memo[$id] = [
                'sorted_purchases' => $this->purchaseHistory->sortByDesc('productIssue.issue_time'),
                'purchase_count' => $this->purchaseHistory->count(),
                'purchase_qty' => $this->purchaseHistory->sum('qty'),
                'sorted_issues' => $this->productApprovedIssue->sortByDesc('productIssue.issue_time'),
                'issue_qty' => $this->productApprovedIssue->sum('quantity'),
                'issue_count' => $this->productApprovedIssue->count(),
            ];
        }

        $m = self::$memo[$id];

        return [
            'id' => $id,
            'product_id' => $this->product_id,
            'title' => $this->option?->name . " (".$this->option_value . ")",
            'option_id' => $this->option_id,
            'option' => $this->option,
            'option_name' => $this->option?->name,
            'option_purchase_history' => PurchaseHistoryResource::collection($m['sorted_purchases']),
            'purchase_history_count' => $m['purchase_count'],
            'purchase_history_qty' => $m['purchase_qty'],
            'product_issue' => ProductIssueWithRateLogResource::collection($m['sorted_issues']),
            'issue_qty' => $m['issue_qty'],
            'product_issue_count' => $m['issue_count'],
            'sku' => $this->sku,
            'option_value' => $this->option_value,
            'stock' => $this->stock,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
