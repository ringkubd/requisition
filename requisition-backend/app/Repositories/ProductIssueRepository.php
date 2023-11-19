<?php

namespace App\Repositories;

use App\Models\ProductIssue;
use App\Repositories\BaseRepository;

class ProductIssueRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'product_id',
        'product_option_id',
        'quantity',
        'receiver_id',
        'issuer_id',
        'issue_time',
        'purpose',
        'uses_area',
        'note',
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return ProductIssue::class;
    }
}
