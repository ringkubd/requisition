<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'title' => $this->option?->name . " (".$this->option_value . ")",
            'option_id' => $this->option_id,
            'option' => $this->option,
            'option_name' => $this->option?->name,
            'option_purchase_history' => PurchaseHistoryResource::collection($this->purchaseHistory->sortByDesc('productIssue.issue_time')),
            'purchase_history_count' => $this->purchaseHistory->count(),
            'product_issue' => ProductIssueWithRateLogResource::collection($this->productApprovedIssue->sortByDesc('productIssue.issue_time')),
            'issue_qty' => $this->productApprovedIssue->sum('quantity'),
            'product_issue_count' => $this->productApprovedIssue->count(),
            'sku' => $this->sku,
            'option_value' => $this->option_value,
            'stock' => $this->stock,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
