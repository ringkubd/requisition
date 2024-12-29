<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
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
            'organization_id' => $this->organization_id,
            'organization' => $this->organization,
            'organization_name' => $this->organization?->name,
            'branch_id' => $this->branch_id,
            'branch' => $this->branch,
            'branch_name' => $this->branch?->name,
            'head_of_department' => $this->head_of_department,
            'departmentHead' => $this->departmentHead,
            'name' => $this->name,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
