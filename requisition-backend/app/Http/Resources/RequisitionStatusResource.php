<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionStatusResource extends JsonResource
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
            'requisition_type' => $this->requisition_type,
            'requisition_id' => $this->requisition_id,
            'department_id' => $this->department_id,
            'department' => $this->department,
            'department_status' => $this->department_status,
            'accounts_status' => $this->accounts_status,
            'ceo_status' => $this->ceo_status,
            'notes' => $this->notes,
            'department_approved_by' => $this->department_approved_by,
            'department_approved_at' => $this->department_approved_at,
            'departmentApprovedBy' => $this->departmentApprovedBy,
            'accountsApprovedBy' => $this->accountsApprovedBy,
            'accounts_approved_by' => $this->accounts_approved_by,
            'accounts_approved_at' => $this->accounts_approved_at,
        ];
    }
}
