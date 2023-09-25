<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class InitialRequisitionProductResource extends JsonResource
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
            'initial_requisition_id' => $this->initial_requisition_id,
            'product_id' => $this->product_id,
            'title' => $this->product->title,
            'stock' => $this->product_variant?->stock,
            'product' => $this->product,
            'product_option_id' => $this->product_option_id,
            'product_option' => $this->product_variant,
            'last_purchase_date' => $this->last_purchase_date,
            'last_purchase_date_formated' => Carbon::parse($this->last_purchase_date)->format('d M Y'),
            'required_quantity' => $this->required_quantity,
            'available_quantity' => $this->available_quantity,
            'quantity_to_be_purchase' => $this->quantity_to_be_purchase,
            'purpose' => $this->purpose,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
