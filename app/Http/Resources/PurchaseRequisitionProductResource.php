<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class PurchaseRequisitionProductResource extends JsonResource
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
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchase' => $this->purchase->where('purchase_requisition_id', $this->purchase_requisition_id)->toArray(),
            'product_id' => $this->product_id,
            'title' => $this->product?->title,
            'stock' => $this->product_variant?->stock,
            'product' => $this->product->load('category'),
            'product_option_id' => $this->product_option_id,
            'product_option' => new ProductOptionResource($this->product_variant),
            'last_purchase_date' => $this->last_purchase_date,
            'last_purchase_date_formated' => Carbon::parse($this->last_purchase_date)->format('d M Y'),
            'required_quantity' => $this->required_quantity,
            'available_quantity' => $this->available_quantity,
            'quantity_to_be_purchase' => $this->quantity_to_be_purchase,
            'actual_purchase' => $this->actual_purchase,
            'unit_price' => $this->unit_price,
            'purpose' => $this->purpose,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
