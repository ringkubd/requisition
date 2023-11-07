<?php

namespace App\Repositories;

use App\Models\Brand;
use App\Repositories\BaseRepository;

class BrandRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'name',
        'logo',
        'contact',
        'address'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Brand::class;
    }
}
