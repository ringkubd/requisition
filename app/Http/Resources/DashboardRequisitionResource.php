<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class DashboardRequisitionResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user' => $this->user,
            'branch' => $this->branch,
            'department_id' => $this->department_id,
            'department' => $this->department,
            'irf_no' => $this->irf_no,
            'ir_no' => $this->ir_no,
            'estimated_cost' => $this->estimated_cost,
            'category' => $this->initialRequisitionProducts->load('product.category')->first()?->product?->category?->title,
            'required_item' => $this->initialRequisitionProducts->count(),
            'is_purchase_requisition_generated' => $this->is_purchase_requisition_generated,
            'purchase_requisitions' => $this->purchaseRequisitions,
            'is_purchase_done' => $this->is_purchase_done,
            'total_required_unit' => $this->initialRequisitionProducts->sum('required_quantity'),
            'deleted_at' => $this->deleted_at,
            'approval_status' => new RequisitionStatusResource($this->approval_status),
            'purchase_approval_status' => new RequisitionStatusResource($this->purchaseRequisitions?->approval_status),
            'current_status' => $this->approval_status?->current_status,
            'purchase_current_status' => $this->purchaseRequisitions?->approval_status?->current_status,
            'created_at' => Carbon::parse($this->created_at)->format('H:i d-M-Y'),
            'updated_at' => $this->updated_at
        ];
    }
}
