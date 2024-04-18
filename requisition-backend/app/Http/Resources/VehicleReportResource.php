<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleReportResource extends JsonResource
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
            'vehicle' => $this->brand." (".$this->reg_no.")",
            'model' => $this->model,
            'month' => Carbon::parse($this->vehicleHistories->first()?->refuel_date)->format('M Y'),
            'fuel' => $this->vehicleHistories->first()?->unit,
            'quantity' => number_format($this->vehicleHistories->sum('quantity'), 2),
            'cost' => array_sum($this->vehicleHistories->map(function ($vh){
                return round($vh->quantity * $vh->rate);
            })->toArray()),
            'millage' => array_sum($this->vehicleHistories->map(function ($vh){
                return round($vh->current_mileage - $vh->last_mileage);
            })->toArray()),
            'first_refuel_millage' => $this->vehicleHistories->sortBy('refuel_date')->first()->current_mileage,
            'last_refuel_millage' => $this->vehicleHistories->sortByDesc('refuel_date')->first()->current_mileage,
        ];
    }
}
