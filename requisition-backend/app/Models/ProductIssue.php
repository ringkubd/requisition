<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="ProductIssue",
 *      required={"purchase_requisition_id","product_id","product_option_id","quantity","receiver_id","issuer_id"},
 *      @OA\Property(
 *          property="quantity",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="issue_time",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *          format="date-time"
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
 */class ProductIssue extends Model
{
    use SoftDeletes;
    use HasFactory;
    public $table = 'product_issues';

    public $fillable = [
        'purchase_requisition_id',
        'product_id',
        'product_option_id',
        'quantity',
        'receiver_id',
        'issuer_id',
        'issue_time'
    ];

    protected $casts = [
        'quantity' => 'float',
        'issue_time' => 'datetime'
    ];

    public static array $rules = [
        'purchase_requisition_id' => 'required',
        'product_id' => 'required',
        'product_option_id' => 'required',
        'quantity' => 'required|numeric',
        'receiver_id' => 'required',
    ];

    public function issuer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'issuer_id');
    }

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Product::class, 'product_id');
    }

    public function productOption(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\ProductOption::class, 'product_option_id');
    }

    public function purchaseRequisition(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\PurchaseRequisition::class, 'purchase_requisition_id');
    }

    public function receiver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'receiver_id');
    }
}