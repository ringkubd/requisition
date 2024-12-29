<?php

namespace App\Repositories;

use App\Models\ProductIssueItems;
use App\Repositories\BaseRepository;

class ProductIssueItemsRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'product_issue_id',
        'product_id',
        'product_option_id',
        'use_in_category',
        'quantity',
        'balance_before_issue',
        'balance_after_issue',
        'purpose',
        'uses_area',
        'note'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return ProductIssueItems::class;
    }
}
