<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleYearlyReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reportYear = $request->year ?: Carbon::now()->format('Y');
        $yearlyHistories = $this->vehicleHistories
            ->sortBy(fn($vehicleHistory) => Carbon::parse($vehicleHistory->refuel_date)->timestamp)
            ->values();

        $firstHistory = $yearlyHistories->first();
        $lastHistory = $yearlyHistories->last();
        $totalQuantity = (float) $yearlyHistories->sum('quantity');
        $totalCost = (float) $yearlyHistories->sum(function ($vehicleHistory) {
            return $vehicleHistory->quantity * $vehicleHistory->rate;
        });

        return [
            'id' => $this->id,
            'vehicle' => $this->brand . " (" . $this->reg_no . ")",
            'model' => $this->model,
            'year' => (string) $reportYear,
            'entries' => $yearlyHistories->count(),
            'quantity' => number_format($totalQuantity, 2, '.', ''),
            'average_rate' => number_format($totalQuantity > 0 ? ($totalCost / $totalQuantity) : 0, 2, '.', ''),
            'average_monthly_cost' => number_format($yearlyHistories->count() > 0 ? ($totalCost / 12) : 0, 2, '.', ''),
            'cost' => round($totalCost),
            'millage' => $yearlyHistories->sum(function ($vehicleHistory) {
                return round($vehicleHistory->current_mileage - $vehicleHistory->last_mileage);
            }),
            'first_refuel_millage' => $firstHistory?->current_mileage,
            'last_refuel_millage' => $lastHistory?->current_mileage,
            'first_refuel_date' => $firstHistory?->refuel_date,
            'last_refuel_date' => $lastHistory?->refuel_date,
        ];
    }
}
