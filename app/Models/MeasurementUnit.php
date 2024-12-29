<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="MeasurementUnit",
 *      required={"unit_code","unit_name"},
 *      @OA\Property(
 *          property="unit_code",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="unit_name",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
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
class MeasurementUnit extends BaseModel
{
     use HasFactory;
     public $table = 'measurement_units';

    public $fillable = [
        'unit_code',
        'unit_name'
    ];

    protected $casts = [
        'unit_code' => 'string',
        'unit_name' => 'string'
    ];

    public static array $rules = [
        'unit_code' => 'required|string|max:255',
        'unit_name' => 'required|string|max:255',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];


}
