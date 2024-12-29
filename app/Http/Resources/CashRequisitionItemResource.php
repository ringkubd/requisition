<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CashRequisitionItemResource extends JsonResource
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
            'cash_requisition_id' => $this->cash_requisition_id,
            'item' => $this->item,
            'unit' => $this->unit,
            'required_unit' => $this->required_unit,
            'unit_price' => $this->unit_price,
            'cost' => round($this->required_unit * $this->unit_price),
            'last_purchase_date' => $this->last_purchase_date,
            'purpose' => $this->purpose,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
