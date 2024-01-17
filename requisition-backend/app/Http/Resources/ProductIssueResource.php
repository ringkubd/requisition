<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductIssueResource extends JsonResource
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
            'uuid' => $this->uuid,
            'products' => $this->items,
            'receiver_id' => $this->receiver_id,
            'receiver' => $this->receiver,
            'receiver_department' => $this->receiverDepartment,
            'receiver_department_id' => $this->receiver_department_id,
            'issuer_id' => $this->issuer_id,
            'issuer' => $this->issuer,
            'issuer_department' => $this->issuerDepartment,
            'purpose' => $this->purpose,
            'uses_area' => $this->uses_area,
            'note' => $this->note,
            'issue_time' => $this->issue_time,
            'department_status' => $this->department_status,
            'department_approved_by' => $this->department_approved_by,
            'departmentApprovedBY' => $this->departmentApprovedBY,
            'department_approved_at' => $this->department_approved_at,
            'store_approved_by' => $this->store_approved_by,
            'storeApprovedBY' => $this->storeApprovedBY,
            'store_approved_at' => $this->store_approved_at,
            'store_status' => $this->store_status,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
