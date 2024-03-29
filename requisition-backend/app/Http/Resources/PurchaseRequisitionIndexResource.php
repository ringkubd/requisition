<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequisitionIndexResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user' => $this->user,
            'department_id' => $this->department_id,
            'department' => $this->department,
            'prf_no' => $this->prf_no,
            'irf_no' => $this->irf_no,
            'ir_no' => $this->ir_no,
            'po_no' => $this->po_no,
            'estimated_total_amount' => round($this->estimated_total_amount),
            'received_amount' => $this->received_amount,
            'payment_type' => $this->payment_type,
            'total_required_unit' => $this->purchaseRequisitionProducts?->sum('required_quantity'),
            'category' => $this->purchaseRequisitionProducts->load('product.category')->first()?->product?->category?->title,
            'no_of_item' => $this->purchaseRequisitionProducts?->count(),
            'approval_status' => new RequisitionStatusResource($this->approval_status),
            'current_status' => $this->approval_status?->current_status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
