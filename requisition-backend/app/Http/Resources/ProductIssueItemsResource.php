<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueItemsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'product_issue_id' => $this->product_issue_id,
            'product_id' => $this->product_id,
            'product_option_id' => $this->product_option_id,
            'use_in_category' => $this->use_in_category,
            'quantity' => $this->quantity,
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
