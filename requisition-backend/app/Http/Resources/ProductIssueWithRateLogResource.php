<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueWithRateLogResource extends JsonResource
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
            'purchase_requisition' => $this->purchaseRequisition,
            'product_id' => $this->product_id,
            'product_option_id' => $this->product_option_id,
            'average_rate' => max($this->rateLog->sum('unit_price'), 0) / max($this->rateLog->count(), 1),
            'total_price' => $this->rateLog->sum('total_price'),
            'rateLog' => $this->rateLog,
            'quantity' => $this->quantity,
            'receiver_id' => $this->productIssue->receiver_id,
            'receiver' => $this->receiver,
            'receiver_department' => $this->productIssue->receiverDepartment,
            'issuer_id' => $this->productIssue->issuer_id,
            'issuer' => $this->productIssue->issuer,
            'purpose' => $this->purpose,
            'uses_area' => $this->uses_area,
            'note' => $this->note,
            'use_date' => $this->use_date,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
