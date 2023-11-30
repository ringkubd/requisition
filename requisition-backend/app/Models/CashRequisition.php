<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="CashRequisition",
 *      required={"user_id","branch_id","department_id","irf_no","ir_no","total_cost"},
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
 *          property="total_cost",
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
 */class CashRequisition extends Model
{
    use SoftDeletes;
    use HasFactory;
    protected $table = 'cash_requisitions';

    protected $fillable = [
        'user_id',
        'branch_id',
        'department_id',
        'irf_no',
        'ir_no',
        'total_cost'
    ];

    protected $casts = [
        'irf_no' => 'string',
        'ir_no' => 'string',
        'total_cost' => 'float'
    ];

    public static array $rules = [
        'user_id' => 'required',
        'branch_id' => 'required',
        'department_id' => 'required',
        'irf_no' => 'required|string|max:255',
        'ir_no' => 'required|string|max:255',
        'total_cost' => 'required|numeric',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function branch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id');
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function cashRequisitionItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\CashRequisitionItem::class, 'cash_requisition_id');
    }

    public function irfNos(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(IrfNo::class, 'model');
    }
}
