<?php

namespace App\Repositories;

use App\Models\Purchase;
use App\Repositories\BaseRepository;

class PurchaseRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'product_id',
        'supplier_id',
        'purchase_requisition_id',
        'qty',
        'unit_price',
        'total_price',
        'user_id'
    ];

    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    public function model(): string
    {
        return Purchase::class;
    }
}
