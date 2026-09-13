<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashExpenseCategory extends Model
{
    use HasFactory;

    public $table = 'cash_expense_categories';

    public $fillable = [
        'name',
        'sort_order',
        'is_active',
        'model',
    ];

    protected $casts = [
        'name' => 'string',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'model' => 'string',
    ];

    public static array $rules = [
        'name' => 'required|string|max:255',
        'sort_order' => 'nullable|integer',
        'is_active' => 'nullable|boolean',
    ];
}
