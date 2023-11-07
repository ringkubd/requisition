<?php

namespace App\Repositories;

use App\Models\ProductOption;
use App\Repositories\BaseRepository;

class ProductOptionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'product_id',
        'option_id',
        'sku',
        'option_value',
        'stock'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return ProductOption::class;
    }
}
