<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes; use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="ProductOption",
 *      required={"product_id","option_id","option_value","stock"},
 *      @OA\Property(
 *          property="sku",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="option_value",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="stock",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
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
 */class ProductOption extends BaseModel
{
     use SoftDeletes;
     use HasFactory;
     public $table = 'product_options';

    protected $fillable = [
        'product_id',
        'option_id',
        'sku',
        'option_value',
        'notes',
        'stock'
    ];

    protected $casts = [
        'sku' => 'string',
        'option_value' => 'string',
        'stock' => 'float'
    ];

    public static array $rules = [
        'product_id' => 'required',
        'option_id' => 'required',
        'sku' => 'nullable|string|max:255',
        'option_value' => 'required|string|max:255',
        'stock' => 'nullable|numeric',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function option(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Option::class, 'option_id');
    }

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Product::class, 'product_id');
    }

    public function purchaseHistory(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Purchase::class)->latest('purchase_date');
    }

    public function productIssue(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductIssueItems::class);
    }

    public function productApprovedIssue(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductIssueItems::class)->with('productIssue')->whereHas('productIssue', function ($q){
            $q->where('store_status', 1);
        });
    }

    public function issuePurchaseLog(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(IssuePurchaseLog::class);
    }
}
