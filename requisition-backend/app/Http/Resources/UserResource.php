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
            'mobile_no' => $this->mobile_no,
            'email' => $this->email,
            'organizations' => $this->organizations,
            'organization_name' => implode(',',$this->organizations->pluck('name')->toArray()),
            'organization_id' => $this->organizations->pluck('id')->toArray(),
            'selected_organization' => auth_organization_id(),
            'default_department_id' => $this->default_department_id,
            'default_department_name' => $this->defaultDepartment?->name,
            'default_branch_id' => $this->default_branch_id,
            'default_branch_name' => $this->defaultBranch?->name,
            'default_organization_id' => $this->default_organization_id,
            'default_organization_name' => $this->defaultOrganization?->name,
            'branches' => $this->branches,
            'branch_name' => implode(',',$this->branches->pluck('name')->toArray()),
            'branch_id' => $this->branches->pluck('id')->toArray(),
            'roles' => $this->roles->pluck('id')->toArray(),
            'role_object' => $this->roles,
            'role_names' => implode(',',$this->roles->pluck('name')->toArray()),
            'permissions' => $this->getAllPermissions(),
            'selected_branch' => auth_branch_id(),
            'departments' => $this->departments,
            'department_name' => ucwords(implode(',',$this->departments->pluck('name')->toArray())),
            'department_id' => $this->departments->pluck('id')->toArray(),
            'selected_department' => auth_department_id(),
//            'current_department_head' => $this->defaultDepartment?->head_of_department,
            'current_department_head' => auth_department_head(),
            'cash_approval_permission' => $this->hasPermissionTo('accounts-approval-cash'),
            'purchase_approval_permission' => $this->hasPermissionTo('accounts-approval-purchase'),
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
