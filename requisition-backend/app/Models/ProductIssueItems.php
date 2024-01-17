<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="ProductIssueItems",
 *      required={"product_issue_id","product_id","product_option_id","quantity"},
 *      @OA\Property(
 *          property="quantity",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="balance_before_issue",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="balance_after_issue",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="purpose",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="uses_area",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="note",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="deleted_at",
 *          description="",
 *          readOnly=true,
 *          nullable=true,
 *          type="string",
 *          format="date-time"
 *      ),
 *      @OA\Property(
 *          property="created_at",
 *          description="",
 *          readOnly=true,
 *          nullable=true,
 *          type="string",
 *          format="date-time"
 *      ),
 *      @OA\Property(
 *          property="updated_at",
 *          description="",
 *          readOnly=true,
 *          nullable=true,
 *          type="string",
 *          format="date-time"
 *      )
 * )
 */class ProductIssueItems extends Model
{
    use HasFactory, SoftDeletes;
    public $table = 'product_issue_items';

    public $fillable = [
        'product_issue_id',
        'product_id',
        'product_option_id',
        'use_in_category',
        'quantity',
        'balance_before_issue',
        'balance_after_issue',
        'purpose',
        'uses_area',
        'note'
    ];

    protected $casts = [
        'quantity' => 'float',
        'balance_before_issue' => 'float',
        'balance_after_issue' => 'float',
        'purpose' => 'string',
        'uses_area' => 'string',
        'note' => 'string'
    ];

    public static array $rules = [
        'product_issue_id' => 'required',
        'product_id' => 'required',
        'product_option_id' => 'required',
        'use_in_category' => 'nullable',
        'quantity' => 'required|numeric',
        'balance_before_issue' => 'nullable|numeric',
        'balance_after_issue' => 'nullable|numeric',
        'purpose' => 'nullable|string|max:255',
        'uses_area' => 'nullable|string|max:255',
        'note' => 'nullable|string|max:255',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function useInCategory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Category::class, 'use_in_category');
    }

    public function productOption(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\ProductOption::class, 'product_option_id');
    }

    public function productIssue(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\ProductIssue::class, 'product_issue_id');
    }

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Product::class, 'product_id');
    }
}
