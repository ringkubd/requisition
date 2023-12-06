<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes; use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="PurchaseRequisition",
 *      required={"initial_requisition_id","estimated_total_amount","received_amount","payment_type"},
 *      @OA\Property(
 *          property="estimated_total_amount",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="received_amount",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="payment_type",
 *          description="Cash, Cheque, LPO, Fund available,Maybe Arranged on",
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
 */class PurchaseRequisition extends BaseModel
{
     use SoftDeletes;
     use HasFactory;
     public $table = 'purchase_requisitions';

    protected $fillable = [
        'initial_requisition_id',
        'user_id',
        'branch_id',
        'department_id',
        'initial_requisition_id',
        'irf_no',
        'ir_no',
        'po_no',
        'estimated_total_amount',
        'received_amount',
        'payment_type',
        'status',
    ];

    protected $casts = [
        'estimated_total_amount' => 'float',
        'received_amount' => 'float',
        'payment_type' => 'boolean'
    ];

    public static array $rules = [
        'initial_requisition_id' => 'required',
        'estimated_total_amount' => 'required|numeric',
        'received_amount' => 'required|numeric',
        'payment_type' => 'required|boolean',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function initialRequisition(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\InitialRequisition::class, 'initial_requisition_id');
    }

    public function purchaseRequisitionProducts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\PurchaseRequisitionProduct::class, 'purchase_requisition_id');
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
