<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="Category",
 *      required={"title", "organization_id", "branch_id"},
 *      @OA\Property(
 *          property="title",
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
 */class Category extends BaseModel
{
    use SoftDeletes, HasFactory;
    public $table = 'categories';

    public $fillable = [
        'parent_id',
        'title',
        'description',
        'code'
    ];

    protected $casts = [
        'title' => 'string',
        'description' => 'string'
    ];

    public static array $rules = [
        'parent_id' => 'nullable',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string|max:65535',
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

    public function products(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Product::class, 'category_id');
    }

    public function subCategory(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function parentCategory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function organization(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
    public function branch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

}
