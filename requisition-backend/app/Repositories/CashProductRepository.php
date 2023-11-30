<?php

namespace App\Repositories;

use App\Models\CashProduct;
use App\Repositories\BaseRepository;

class CashProductRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'title'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return CashProduct::class;
    }
}
