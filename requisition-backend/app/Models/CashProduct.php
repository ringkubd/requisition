<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="CashProduct",
 *      required={"title"},
 *      @OA\Property(
 *          property="title",
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
class CashProduct extends BaseModel
{
    use HasFactory;
    protected $table = 'cash_products';

    protected $fillable = [
        'title'
    ];

    protected $casts = [
        'title' => 'string'
    ];

    public static array $rules = [
        'title' => 'required|string|max:255',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function last_purchase(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CashRequisitionItem::class, 'item', 'title')->orderByDesc('created_at');
    }


}
