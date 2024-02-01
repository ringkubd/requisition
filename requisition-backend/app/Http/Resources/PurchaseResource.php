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
            'product_category' => $this->product?->category?->title,
            'product_title' => $this->product?->title,
            'product_option_id' => $this->product_option_id,
            'productOption' => new ProductOptionResource($this->productOption),
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->supplier,
            'origin' => $this->origin,
            'bill_no' => $this->bill_no,
            'chalan_no' => $this->chalan_no,
            'expiry_date' => $this->expiry_date,
            'brand' => $this->brand,
            'brand_id' => $this->brand_id,
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchaseRequisition' => $this->purchaseRequisition,
            'requisite_department' => $this->purchaseRequisition?->department?->name,
            'rateLog' => $this->rateLog,
            'qty' => $this->qty,
            'unit_price' => $this->unit_price,
            'total_price' => round($this->total_price),
            'purchase_date' => $this->purchase_date,
            'available_qty' => $this->available_qty,
            'notes' => $this->notes,
            'user_id' => $this->user_id,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
