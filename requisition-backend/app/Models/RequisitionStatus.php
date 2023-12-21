<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
 use Illuminate\Database\Eloquent\SoftDeletes; use Illuminate\Database\Eloquent\Factories\HasFactory;
/**
 * @OA\Schema(
 *      schema="RequisitionStatus",
 *      required={"requisition_type","requisition_id","department_id","department_status","accounts_status","ceo_status"},
 *      @OA\Property(
 *          property="requisition_type",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="department_status",
 *          description="0 =&gt; not arrived, 1 =&gt; pending, 2 =&gt; approved, 3 =&gt; rejected, 4 =&gt; required change",
 *          readOnly=false,
 *          nullable=false,
 *          type="boolean",
 *      ),
 *      @OA\Property(
 *          property="accounts_status",
 *          description="0 =&gt; not arrived, 1 =&gt; pending, 2 =&gt; approved, 3 =&gt; rejected, 4 =&gt; required change",
 *          readOnly=false,
 *          nullable=false,
 *          type="boolean",
 *      ),
 *      @OA\Property(
 *          property="ceo_status",
 *          description="0 =&gt; not arrived, 1 =&gt; pending, 2 =&gt; approved, 3 =&gt; rejected, 4 =&gt; required change",
 *          readOnly=false,
 *          nullable=false,
 *          type="boolean",
 *      ),
 *      @OA\Property(
 *          property="notes",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
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
 */class RequisitionStatus extends Model
{
     use SoftDeletes;    use HasFactory;    public $table = 'requisition_statuses';

    public $fillable = [
        'requisition_type',
        'requisition_id',
        'department_id',
        'department_status',
        'accounts_status',
        'ceo_status',
        'notes',
        'department_approved_by',
        'accounts_approved_by'
    ];

    protected $casts = [
        'requisition_type' => 'string',
        'department_status' => 'boolean',
        'accounts_status' => 'boolean',
        'ceo_status' => 'boolean',
        'notes' => 'string'
    ];

    public static array $rules = [
        'requisition_type' => 'required|string|max:255',
        'requisition_id' => 'required',
        'department_id' => 'required',
        'department_status' => 'required|boolean',
        'accounts_status' => 'required|boolean',
        'ceo_status' => 'required|boolean',
        'notes' => 'nullable|string|max:65535',
        'department_approved_by' => 'nullable',
        'accounts_approved_by' => 'nullable',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function accountsApprovedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'accounts_approved_by');
    }

    public function departmentApprovedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'department_approved_by');
    }

    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id');
    }
}
