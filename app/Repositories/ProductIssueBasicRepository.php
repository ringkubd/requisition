<?php

namespace App\Repositories;

use App\Models\ProductIssueBasic;
use App\Repositories\BaseRepository;

class ProductIssueBasicRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'uuid',
        'receiver_id',
        'receiver_branch_id',
        'receiver_department_id',
        'issuer_id',
        'issuer_branch_id',
        'issuer_department_id',
        'number_of_item',
        'issue_time',
        'department_status',
        'department_approved_by',
        'store_status',
        'store_approved_by'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return ProductIssueBasic::class;
    }
}
