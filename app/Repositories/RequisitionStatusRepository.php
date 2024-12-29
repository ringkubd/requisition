<?php

namespace App\Repositories;

use App\Models\RequisitionStatus;
use App\Repositories\BaseRepository;

class RequisitionStatusRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'requisition_type',
        'requisition_id',
        'department_id',
        'department_status',
        'accounts_status',
        'ceo_status',
        'notes',
        'department_approved_by',
        'accounts_approved_by'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return RequisitionStatus::class;
    }
}
