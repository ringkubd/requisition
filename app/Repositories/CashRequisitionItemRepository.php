<?php

namespace App\Repositories;

use App\Models\CashRequisitionItem;
use App\Repositories\BaseRepository;

class CashRequisitionItemRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'cash_requisition_id',
        'item',
        'unit',
        'required_unit',
        'unit_price',
        'purpose'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return CashRequisitionItem::class;
    }
}
