<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CashRequisitionResource extends JsonResource
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
            'branch_id' => $this->branch_id,
            'branch' => $this->branch,
            'department' => $this->department,
            'department_id' => $this->department_id,
            'items' => CashRequisitionItemResource::collection($this->cashRequisitionItems),
            'prf_no' => $this->prf_no,
            'ir_no' => $this->ir_no,
            'approval_status' => new RequisitionStatusResource($this->approval_status),
            'current_status' => $this->approval_status?->current_status,
            'total_cost' => number_format(round($this->total_cost)),
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
