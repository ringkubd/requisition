<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
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
            'product_id' => $this->product_id,
            'product' => $this->product,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->supplier,
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchaseRequisition' => $this->purchaseRequisition,
            'qty' => $this->qty,
            'unit_price' => $this->unit_price,
            'total_price' => $this->total_price,
            'user_id' => $this->user_id,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
