<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class InitialRequisitionResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user' => $this->user,
            'branch' => $this->branch,
            'department_id' => $this->department_id,
            'department' => $this->department,
            'irf_no' => $this->irf_no,
            'ir_no' => $this->ir_no,
            'estimated_cost' => $this->estimated_cost,
            'requisition_products' => InitialRequisitionProductResource::collection($this->initialRequisitionProducts),
            'is_purchase_requisition_generated' => $this->is_purchase_requisition_generated,
            'purchase_requisitions' => $this->purchaseRequisitions?->where('status', 1),
            'is_purchase_done' => $this->is_purchase_done,
            'total_required_unit' => $this->initialRequisitionProducts->sum('required_quantity'),
            'deleted_at' => $this->deleted_at,
            'created_at' => Carbon::parse($this->created_at)->format('H:i d-M-Y'),
            'updated_at' => $this->updated_at
        ];
    }
}
