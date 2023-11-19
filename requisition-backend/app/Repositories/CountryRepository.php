<?php

namespace App\Repositories;

use App\Models\Country;
use App\Repositories\BaseRepository;

class CountryRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'country_code',
        'country_name'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Country::class;
    }
}
