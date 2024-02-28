<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes; use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="Vehicle",
 *      required={"brand","model","reg_no","cash_product_id","ownership"},
 *      @OA\Property(
 *          property="brand",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="model",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="reg_no",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="ownership",
 *          description="0 =&gt; owned, 1 =&gt; rental",
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
 */class Vehicle extends Model
{
     use SoftDeletes;    use HasFactory;    public $table = 'vehicles';

    public $fillable = [
        'brand',
        'model',
        'reg_no',
        'cash_product_id',
        'ownership'
    ];

    protected $casts = [
        'brand' => 'string',
        'model' => 'string',
        'reg_no' => 'string',
//        'ownership' => 'boolean'
    ];

    public static array $rules = [
        'brand' => 'required|string|max:255',
        'model' => 'required|string|max:255',
        'reg_no' => 'required|string|max:255',
        'cash_product_id' => 'required',
        'ownership' => 'required|boolean',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function cashProduct(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\CashProduct::class, 'cash_product_id');
    }

    public function vehicleHistories(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\VehicleHistory::class, 'vehicle_id');
    }
}
