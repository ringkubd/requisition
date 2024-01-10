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
            'purchase_requisition_id' => $this->purchase_requisition_id,
            'purchase_requisition' => $this->purchaseRequisition,
            'product_id' => $this->product_id,
            'product' => $this->product,
            'product_option_id' => $this->product_option_id,
            'variant' => new ProductOptionResource($this->productOption),
            'rateLog' => $this->rateLog,
            'average_rate' => max($this->rateLog->sum('unit_price'), 1) / max($this->rateLog->count(), 1),
            'total_price' =>  round($this->rateLog->sum('total_price')),
            'quantity' => $this->quantity,
            'receiver_id' => $this->receiver_id,
            'receiver' => $this->receiver,
            'receiver_department' => $this->receiverDepartment,
            'receiver_department_id' => $this->receiver_department_id,
            'issuer_id' => $this->issuer_id,
            'issuer' => $this->issuer,
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
            'use_in_category' => $this->use_in_category,
            'useInCategory' => $this->useInCategory,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
