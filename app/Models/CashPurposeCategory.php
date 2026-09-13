<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashPurposeCategory extends Model
{
    use HasFactory;

    public $table = 'cash_purpose_categories';

    public $fillable = [
        'purpose_hash',
        'item',
        'purpose',
        'category',
        'category_id',
        'confidence',
        'model',
        'is_manual',
        'classified_at',
    ];

    protected $casts = [
        'item' => 'string',
        'purpose' => 'string',
        'category' => 'string',
        'category_id' => 'integer',
        'confidence' => 'float',
        'model' => 'string',
        'is_manual' => 'boolean',
        'classified_at' => 'datetime',
    ];

    public function category_ref(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CashExpenseCategory::class, 'category_id');
    }
}
