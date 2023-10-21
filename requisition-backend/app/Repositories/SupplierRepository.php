<?php

namespace App\Repositories;

use App\Models\Supplier;
use App\Repositories\BaseRepository;

class SupplierRepository extends BaseRepository
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
        return Supplier::class;
    }
}
