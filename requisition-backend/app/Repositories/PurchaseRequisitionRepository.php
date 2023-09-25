<?php

namespace App\Repositories;

use App\Models\PurchaseRequisition;
use App\Repositories\BaseRepository;

class PurchaseRequisitionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'initial_requisition_id',
        'estimated_total_amount',
        'received_amount',
        'payment_type'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return PurchaseRequisition::class;
    }
}
