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
            'quantity' => number_format($this->vehicleHistories->where('refuel_date', '<', Carbon::parse($this->vehicleHistories->first()?->refuel_date)->addMonth(1)->firstOfMonth()->toDateString())?->sum('quantity') ?? 0, 2),
            'cost' => array_sum($this->vehicleHistories->sortBy('refuel_date')->where('refuel_date', '<', Carbon::parse($this->vehicleHistories->first()?->refuel_date)->addMonth(1)->firstOfMonth()->toDateString())?->map(function ($vh){
                return round($vh->quantity * $vh->rate);
            })->toArray()),
            'millage' => array_sum($this->vehicleHistories->where('refuel_date', '>', $this->vehicleHistories->first()?->refuel_date)?->map(function ($vh){
                return round($vh->current_mileage - $vh->last_mileage);
            })->toArray()),
            'first_refuel_millage' => $this->vehicleHistories->sortBy('refuel_date')->first()?->current_mileage,
            'last_refuel_millage' => $this->vehicleHistories->sortByDesc('refuel_date')->first()?->current_mileage,
            'first_refuel_date' => $this->vehicleHistories->where('refuel_date', '>', $this->vehicleHistories->first()?->refuel_date)->first()?->refuel_date,
            'last_refuel_date' => $this->vehicleHistories->sortByDesc('refuel_date')->first()?->refuel_date,
        ];
    }
}
