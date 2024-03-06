<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="CashRequisitionItem",
 *      required={"cash_requisition_id","item","unit","required_unit","unit_price","purpose"},
 *      @OA\Property(
 *          property="item",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
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
 *          property="required_unit",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="unit_price",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="number",
 *          format="number"
 *      ),
 *      @OA\Property(
 *          property="purpose",
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
 */class CashRequisitionItem extends BaseModel
{
    use SoftDeletes;
    use HasFactory;
    protected $table = 'cash_requisition_items';

    protected $fillable = [
        'cash_requisition_id',
        'item',
        'unit',
        'required_unit',
        'unit_price',
        'purpose',
        'last_purchase_date'
    ];

    protected $casts = [
        'item' => 'string',
        'unit' => 'string',
        'required_unit' => 'float',
        'unit_price' => 'float',
        'purpose' => 'string'
    ];

    public static array $rules = [
        'cash_requisition_id' => 'required',
        'item' => 'required|string|max:255',
        'unit' => 'required|string|max:255',
        'required_unit' => 'required|numeric',
        'unit_price' => 'required|numeric',
        'purpose' => 'required|string|max:255',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function cashRequisition(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\CashRequisition::class, 'cash_requisition_id');
    }

    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CashProduct::class, 'item', 'title');
    }
}
