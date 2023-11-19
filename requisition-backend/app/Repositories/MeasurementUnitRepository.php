<?php

namespace App\Repositories;

use App\Models\MeasurementUnit;
use App\Repositories\BaseRepository;

class MeasurementUnitRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'unit_code',
        'unit_name'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return MeasurementUnit::class;
    }
}
