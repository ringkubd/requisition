<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductPurchaseLog extends JsonResource
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
        'product_category' => $this->product?->category?->title,
        'product_title' => $this->product?->title,
        'unit' => $this->product?->unit,
        'product_option_id' => $this->product_option_id,
        'variant' =>  $this->productOption?->option_value,
//        'productOption' => new ProductOptionResource($this->productOption),
        'supplier_id' => $this->supplier_id,
        'supplier_name' => $this->supplier?->name,
        'origin' => $this->origin,
        'bill_no' => $this->bill_no,
        'chalan_no' => $this->chalan_no,
        'expiry_date' => $this->expiry_date,
        'brand' => $this->brand,
        'brand_id' => $this->brand_id,
        'purchase_requisition_id' => $this->purchase_requisition_id,
//        'purchaseRequisition' => $this->purchaseRequisition,
        'prf_no' => $this->purchaseRequisition?->prf_no,
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
    ];;
    }
}
