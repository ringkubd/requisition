<?php

namespace App\Repositories;

use App\Models\Vehicle;
use App\Repositories\BaseRepository;

class VehicleRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'brand',
        'model',
        'reg_no',
        'cash_product_id',
        'ownership'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Vehicle::class;
    }
}
