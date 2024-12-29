<?php

namespace App\Repositories;

use App\Models\Pump;
use App\Repositories\BaseRepository;

class PumpRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'name',
        'contact_no',
        'address'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Pump::class;
    }
}
