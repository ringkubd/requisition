<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseHistoryResource extends JsonResource
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
            'product_title' => $this->product?->title,
            'product_option_id' => $this->product_option_id,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->supplier,
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchaseRequisition' => $this->purchaseRequisition,
            'qty' => $this->qty,
            'origin' => $this->origin,
            'chalan_no' => $this->chalan_no,
            'expiry_date' => $this->expiry_date,
            'available_qty' => $this->available_qty,
            'unit_price' => $this->unit_price,
            'total_price' => round($this->total_price),
            'user_id' => $this->user_id,
            'purchase_date' => $this->purchase_date,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
