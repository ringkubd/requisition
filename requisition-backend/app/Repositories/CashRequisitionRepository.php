<?php

namespace App\Repositories;

use App\Models\CashRequisition;
use App\Repositories\BaseRepository;

class CashRequisitionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'user_id',
        'branch_id',
        'department_id',
        'irf_no',
        'ir_no',
        'total_cost'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return CashRequisition::class;
    }
}
