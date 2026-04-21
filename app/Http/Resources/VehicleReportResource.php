<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class VehicleReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reportMonth = $request->month
            ? Carbon::parse('01-' . $request->month)->startOfMonth()
            : Carbon::now()->startOfMonth();
        $monthStart = $reportMonth->copy()->startOfMonth()->toDateString();
        $monthEnd = $reportMonth->copy()->endOfMonth()->toDateString();

        $orderedHistories = $this->vehicleHistories
            ->sortBy(fn($vehicleHistory) => Carbon::parse($vehicleHistory->refuel_date)->timestamp)
            ->values();

        $monthlyHistories = $orderedHistories
            ->filter(function ($vehicleHistory) use ($monthStart, $monthEnd) {
                $refuelDate = Carbon::parse($vehicleHistory->refuel_date)->toDateString();

                return $refuelDate >= $monthStart && $refuelDate <= $monthEnd;
            })
            ->values();

        $firstHistory = $orderedHistories->first();
        $fuelHistory = $monthlyHistories->first() ?? $firstHistory;
        $lastHistory = $orderedHistories->last();

        return [
            'id' => $this->id,
            'vehicle' => $this->brand . " (" . $this->reg_no . ")",
            'model' => $this->model,
            'month' => $reportMonth->format('M Y'),
            'fuel' => $fuelHistory?->unit,
            'quantity' => number_format($monthlyHistories->sum('quantity'), 2),
            'cost' => array_sum($monthlyHistories->map(function ($vh) {
                return round($vh->quantity * $vh->rate);
            })->toArray()),
            'millage' => array_sum($this->historyMileage($orderedHistories)->toArray()),
            'first_refuel_millage' => $firstHistory?->current_mileage,
            'last_refuel_millage' => $lastHistory?->current_mileage,
            'first_refuel_date' => $orderedHistories->skip(1)->first()?->refuel_date,
            'last_refuel_date' => $lastHistory?->refuel_date,
        ];
    }

    protected function historyMileage(Collection $orderedHistories): Collection
    {
        return $orderedHistories->slice(1)->map(function ($vehicleHistory) {
            return round($vehicleHistory->current_mileage - $vehicleHistory->last_mileage);
        });
    }
}
