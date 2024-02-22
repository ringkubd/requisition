<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueLogResource extends JsonResource
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
            'product_issue_id' => $this->product_issue_id,
            'product_id' => $this->product_id,
            'product_title' => $this->product?->title,
            'unit' => $this->product?->unit,
            'product_option_id' => $this->product_option_id,
            'department' => $this->productIssue?->issuerDepartment?->name,
            'variant_title' => $this->productOption->option?->name . " (".$this->productOption->option_value . ")",
            'category' => $this->use_in_category ? $this->useInCategory?->title : $this->category?->title,
            'quantity' => $this->quantity,
            'average_rate' => max($this->rateLog->sum('unit_price'), 0) / max($this->rateLog->count(), 1),
            'total_price' =>  round($this->rateLog->sum('total_price')),
            'balance_before_issue' => $this->balance_before_issue,
            'balance_after_issue' => $this->balance_after_issue,
            'purpose' => $this->purpose,
            'uses_area' => $this->uses_area,
            'use_date' => $this->use_date,
            'note' => $this->note,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
