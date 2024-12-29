<?php

namespace App\Repositories;

use App\Models\VehicleHistory;
use App\Repositories\BaseRepository;

class VehicleHistoryRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'vehicle_id',
        'cash_requisition_id',
        'refuel_date',
        'unit',
        'quantity',
        'rate',
        'bill_no',
        'last_mileage',
        'current_mileage',
        'pump_id',
        'user_id'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return VehicleHistory::class;
    }
}
