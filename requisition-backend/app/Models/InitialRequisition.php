<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes; use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="InitialRequisition",
 *      required={"user_id","department_id","irf_no","ir_no","is_purchase_requisition_generated","is_purchase_done"},
 *      @OA\Property(
 *          property="irf_no",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="ir_no",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="estimated_cost",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="is_purchase_requisition_generated",
 *          description="0 =&gt; No, 1 =&gt; Yes",
 *          readOnly=false,
 *          nullable=false,
 *          type="boolean",
 *      ),
 *      @OA\Property(
 *          property="is_purchase_done",
 *          description="0 =&gt; No, 1 =&gt; Yes",
 *          readOnly=false,
 *          nullable=false,
 *          type="boolean",
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
 */class InitialRequisition extends Model
{
     use SoftDeletes;
     use HasFactory;
     public $table = 'initial_requisitions';

    public $fillable = [
        'user_id',
        'branch_id',
        'department_id',
        'irf_no',
        'ir_no',
        'estimated_cost',
        'is_purchase_requisition_generated',
        'is_purchase_done'
    ];

    protected $casts = [
        'irf_no' => 'string',
        'ir_no' => 'string',
        'estimated_cost' => 'float',
        'is_purchase_requisition_generated' => 'boolean',
        'is_purchase_done' => 'boolean'
    ];

    public static array $rules = [
        'user_id' => 'required',
        'department_id' => 'required',
        'irf_no' => 'required|string|max:255',
        'ir_no' => 'required|string|max:255',
        'estimated_cost' => 'nullable|numeric',
        'is_purchase_requisition_generated' => 'required|boolean',
        'is_purchase_done' => 'required|boolean',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function branch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id');
    }

    public function initialRequisitionProducts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\InitialRequisitionProduct::class, 'initial_requisition_id');
    }

    public function purchaseRequisitions(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Models\PurchaseRequisition::class, 'initial_requisition_id');
    }
    public function irfNos(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(IrfNo::class, 'model');
    }
}
