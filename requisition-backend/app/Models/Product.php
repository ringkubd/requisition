<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="Product",
 *      required={"title","unit","category_id","status", "organization_id","branch_id"},
 *      @OA\Property(
 *          property="title",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="sl_no",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="unit",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="description",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="status",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
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
 */
class Product extends BaseModel
{
    use SoftDeletes, HasFactory;

    public $table = 'products';

    protected $fillable = [
        'title',
        'unit',
        'category_id',
        'description',
        'status',
    ];

    protected $casts = [
        'title' => 'string',
        'sl_no' => 'string',
        'unit' => 'string',
        'description' => 'string',
        'status' => 'string'
    ];

    public static array $rules = [
        'title' => 'required|string|max:255',
        'sl_no' => 'nullable|string|max:255',
        'unit' => 'required|string|max:255',
        'category_id' => 'required',
        'description' => 'nullable|string|max:255',
        'status' => 'required|string',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public static function boot()
    {
        parent::boot();
        self::creating(function ($model){
            $model->organization_id = auth_organization_id();
            $model->branch_id = auth_branch_id();
        });
    }

    protected static function booted()
    {
        static::addGlobalScope('branch_organization', function (Builder $builder){
            $builder->where('organization_id', auth_organization_id())->where('branch_id', auth_branch_id());
        });
    }

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Category::class, 'category_id');
    }

    public function productMetas(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\ProductMeta::class, 'product_id');
    }

    public function productOptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\ProductOption::class, 'product_id');
    }
    public function purchaseHistory(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function lastPurchase(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Purchase::class)->latest();
    }

    public function lastIssue(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductIssueItems::class)->latest();
    }

    public function issues(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductIssueItems::class);
    }

    public function purchaseRequisition(){
        return $this->hasManyThrough(PurchaseRequisition::class, PurchaseRequisitionProduct::class, 'product_id', 'id', 'id', 'purchase_requisition_id');
    }

    public function organization(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
    public function branch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function getLastIssueBYDateAttribute($date)
    {
        return $this->issues()->whereHas('productIssue', function ($q) use($date) {
            return $q->whereRaw("date(store_approved_at) <= '$date'")->where('store_status', 1);
        })->latest()->first();
    }

}
