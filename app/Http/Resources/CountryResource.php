<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
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
            'country_code' => $this->country_code,
            'country_name' => $this->country_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
