<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueItemsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'product_issue_id' => $this->product_issue_id,
            'product_id' => $this->product_id,
            'product' => $this->product,
            'product_option_id' => $this->product_option_id,
            'variant' => $this->productOption,
            'use_in_category' => $this->use_in_category,
            'category' => $this->category,
            'quantity' => $this->quantity,
            'rateLog' => $this->rateLog,
            'average_rate' => max($this->rateLog->sum('unit_price'), 1) / max($this->rateLog->count(), 1),
            'total_price' =>  round($this->rateLog->sum('total_price')),
            'balance_before_issue' => $this->balance_before_issue,
            'balance_after_issue' => $this->balance_after_issue,
            'purpose' => $this->purpose,
            'uses_area' => $this->uses_area,
            'note' => $this->note,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
