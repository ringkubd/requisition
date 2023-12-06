<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InitialRequisitionProduct extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $table = "initial_requisition_products";

    protected $guarded = [];

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function product_variant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id', 'id');
    }
}
