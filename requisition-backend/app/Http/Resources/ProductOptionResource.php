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
            'option_purchase_history' => PurchaseHistoryResource::collection($this->purchaseHistory),
            'purchase_history_count' => $this->purchaseHistory->count(),
            'product_issue' => ProductIssueWithRateLogResource::collection($this->productIssue),
            'product_issue_count' => $this->productIssue->count(),
            'sku' => $this->sku,
            'option_value' => $this->option_value,
            'stock' => $this->stock,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
