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
            'product_current_balance' => $this->productOptions->reduce(function ($o, $n){
                return $n->productApprovedIssue->count() !== 0 ? $o + ($n->productApprovedIssue->first()?->balance_after_issue) : $n->total_stock;
            }, 0),
            'product_current' => $this->productOptions->map(function ($m){
                return $m->currentBalance;
            }),
            'current_options' => $this->productOptions,
            'total_stock' => $this->productOptions->sum('stock'),
            'description' => $this->description,
            'status' => $this->status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
