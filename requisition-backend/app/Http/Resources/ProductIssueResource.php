<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueResource extends JsonResource
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
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchase_requisition' => $this->purchaseRequisition,
            'product_id' => $this->product_id,
            'product' => $this->product,
            'product_option_id' => $this->product_option_id,
            'variant' => new ProductOptionResource($this->productOption),
            'quantity' => $this->quantity,
            'receiver_id' => $this->receiver_id,
            'receiver' => $this->receiver,
            'issuer_id' => $this->issuer_id,
            'issuer' => $this->issuer,
            'purpose' => $this->purpose,
            'uses_area' => $this->uses_area,
            'note' => $this->note,
            'issue_time' => $this->issue_time,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
