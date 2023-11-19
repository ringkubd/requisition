<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MeasurementUnitResource extends JsonResource
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
            'unit_code' => $this->unit_code,
            'unit_name' => $this->unit_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
