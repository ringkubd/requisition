<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes;
 use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="VehicleHistory",
 *      required={"vehicle_id","cash_requisition_id","refuel_date","quantity","rate","last_mileage","current_mileage","user_id"},
 *      @OA\Property(
 *          property="refuel_date",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *          format="date"
 *      ),
 *      @OA\Property(
 *          property="unit",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="quantity",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="rate",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="bill_no",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="last_mileage",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="current_mileage",
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
 */class VehicleHistory extends Model
{
     use SoftDeletes;    use HasFactory;    public $table = 'vehicle_histories';

    public $fillable = [
        'vehicle_id',
        'cash_requisition_id',
        'cash_requisition_item_id',
        'refuel_date',
        'unit',
        'quantity',
        'rate',
        'bill_no',
        'last_mileage',
        'current_mileage',
        'pump_id',
        'user_id'
    ];

    protected $casts = [
        'refuel_date' => 'date',
        'unit' => 'string',
        'quantity' => 'float',
        'rate' => 'float',
        'bill_no' => 'string',
        'last_mileage' => 'float',
        'current_mileage' => 'float'
    ];

    public static array $rules = [
        'vehicle_id' => 'required',
        'cash_requisition_id' => 'required',
        'cash_requisition_item_id' => 'required',
        'refuel_date' => 'required',
        'unit' => 'nullable|string|max:255',
        'quantity' => 'required|numeric',
        'rate' => 'required|numeric',
        'bill_no' => 'nullable|string|max:255',
        'last_mileage' => 'required|numeric',
        'current_mileage' => 'required|numeric',
        'pump_id' => 'nullable',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function vehicle(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Vehicle::class, 'vehicle_id');
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function pump(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Pump::class, 'pump_id');
    }

    public function cashRequisition(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\CashRequisition::class, 'cash_requisition_id');
    }

    public function cashRequisitionItem(): \Illuminate\Database\Eloquent\Relations\BelongsTo{
        return $this->belongsTo(CashRequisitionItem::class);
    }
}
