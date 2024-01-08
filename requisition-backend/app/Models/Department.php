<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="Department",
 *      required={"organization_id","branch_id","name", "head_of_department"},
 *      @OA\Property(
 *          property="name",
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
 *      @QA\Property(
 *          property="head_of_department",
 *          description="",
 *          readOnly=true,
 *          nullable=true,
 *          type=integer,
 *      )
 */
class Department extends BaseModel
{
    use SoftDeletes;    use HasFactory;    public $table = 'departments';

    public $fillable = [
        'organization_id',
        'branch_id',
        'name',
        'head_of_department',
    ];

    protected $casts = [
        'name' => 'string'
    ];

    public static array $rules = [
        'organization_id' => 'required',
        'branch_id' => 'required',
        'name' => 'required|string|max:255',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    /**
     * @return BelongsTo
     */

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    /**
     * @return BelongsTo
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Organization::class, 'organization_id');
    }

    /**
     * @return BelongsTo
     */
    public function departmentHead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_of_department');
    }

    /**
     * @return BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_departments');
    }
}
