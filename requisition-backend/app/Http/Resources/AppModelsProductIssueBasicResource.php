<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AppModelsProductIssueBasicResource extends JsonResource
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
            'receiver_id' => $this->receiver_id,
            'receiver_branch_id' => $this->receiver_branch_id,
            'receiver_department_id' => $this->receiver_department_id,
            'issuer_id' => $this->issuer_id,
            'issuer_branch_id' => $this->issuer_branch_id,
            'issuer_department_id' => $this->issuer_department_id,
            'number_of_item' => $this->number_of_item,
            'issue_time' => $this->issue_time,
            'department_status' => $this->department_status,
            'department_approved_by' => $this->department_approved_by,
            'store_status' => $this->store_status,
            'store_approved_by' => $this->store_approved_by,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
