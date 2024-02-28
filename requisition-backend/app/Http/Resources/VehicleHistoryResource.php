<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VehicleHistoryResource extends JsonResource
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
            'vehicle_id' => $this->vehicle_id,
            'cash_requisition_id' => $this->cash_requisition_id,
            'refuel_date' => $this->refuel_date,
            'unit' => $this->unit,
            'quantity' => $this->quantity,
            'rate' => $this->rate,
            'bill_no' => $this->bill_no,
            'last_mileage' => $this->last_mileage,
            'current_mileage' => $this->current_mileage,
            'pump_id' => $this->pump_id,
            'user_id' => $this->user_id,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
