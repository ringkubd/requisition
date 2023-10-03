<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'organizations' => $this->organizations,
            'organization_name' => implode(',',$this->organizations->pluck('name')->toArray()),
            'organization_id' => $this->organizations->pluck('id')->toArray(),
            'selected_organization' => auth_organization_id(),
            'branches' => $this->branches,
            'branch_name' => implode(',',$this->branches->pluck('name')->toArray()),
            'branch_id' => $this->branches->pluck('id')->toArray(),
            'selected_branch' => auth_branch_id(),
            'departments' => $this->departments,
            'department_name' => implode(',',$this->departments->pluck('name')->toArray()),
            'department_id' => $this->departments->pluck('id')->toArray(),
            'designations' => $this->designations,
            'designation_name' => implode(',',$this->designations->pluck('name')->toArray()),
            'designation_id' => $this->designations->pluck('id')->toArray(),
            'email_verified_at' => $this->email_verified_at,
            'remember_token' => $this->remember_token,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
