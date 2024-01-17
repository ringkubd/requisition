<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="ProductIssue",
 *      required={"product_id","product_option_id","quantity","receiver_id","issuer_id"},
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
 */class ProductIssue extends BaseModel
{
    use SoftDeletes;
    use HasFactory;
    public $table = 'product_issues';

    protected $casts = [
        'quantity' => 'float',
        'issue_time' => 'datetime'
    ];

    public $fillable = [
        'uuid',
        'product_id',
        'product_option_id',
        'quantity',
        'receiver_id',
        'receiver_branch_id',
        'receiver_department_id',
        'issuer_id',
        'issuer_branch_id',
        'issuer_department_id',
        'issue_time',
        'purpose',
        'uses_area',
        'note',
        'department_status',
        'department_approved_by',
        'store_approved_by',
        'store_status',
        'department_approved_at',
        'store_approved_at',
        'use_in_category',
    ];

    public static array $rules = [
        'product_id' => 'required',
        'product_option_id' => 'required',
        'quantity' => 'required|numeric',
        'receiver_id' => 'required',
    ];

    public function issuer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'issuer_id');
    }

    public function issuerBranch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class, 'issuer_branch_id');
    }
    public function issuerDepartment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'issuer_department_id');
    }

    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductIssueItems::class, 'uuid', 'uuid');
    }

    public function receiver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'receiver_id');
    }

    public function receiverDepartment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'receiver_department_id');
    }
    public function receiverBranch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class, 'receiver_branch_id');
    }

    public function departmentApprovedBY(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'department_approved_by');
    }
    public function storeApprovedBY(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'store_approved_by');
    }
}
