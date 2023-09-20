<?php

namespace App\Repositories;

use App\Models\Designation;
use App\Repositories\BaseRepository;

class DesignationRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'organization_id',
        'branch_id',
        'name'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Designation::class;
    }
}
