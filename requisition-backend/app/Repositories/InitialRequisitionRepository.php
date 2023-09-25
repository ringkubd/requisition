<?php

namespace App\Repositories;

use App\Models\InitialRequisition;
use App\Repositories\BaseRepository;

class InitialRequisitionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'user_id',
        'department_id',
        'irf_no',
        'ir_no',
        'estimated_cost',
        'is_purchase_requisition_generated',
        'is_purchase_done'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return InitialRequisition::class;
    }
}
