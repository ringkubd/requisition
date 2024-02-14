<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductBalanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return  [
            'id' => $this->id,
            'title' => $this->title,
            'unit' => $this->unit,
            'category_id' => $this->category_id,
            'category' => $this->category,
            'product_metas' => $this->productMetas,
            'product_options' => ProductOptionResource::collection($this->productOptions),
            'product_current_balance' => $this->productOptions->sum('product_issue.balance_after_issue'),
            'total_stock' => $this->productOptions->sum('stock'),
            'description' => $this->description,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
