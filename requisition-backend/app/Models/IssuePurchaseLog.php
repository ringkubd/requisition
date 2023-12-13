<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IssuePurchaseLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function purchase(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }
    public function issue(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProductIssue::class);
    }
}
