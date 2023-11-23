<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\Rules\Password;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasPermissions;
use Spatie\Permission\Traits\HasRoles;

;
/**
 * @OA\Schema(
 *      schema="User",
 *      required={"name","email","password"},
 *      @OA\Property(
 *          property="name",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="email",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="email_verified_at",
 *          description="",
 *          readOnly=false,
 *          nullable=true,
 *          type="string",
 *          format="date-time"
 *      ),
 *      @OA\Property(
 *          property="password",
 *          description="",
 *          readOnly=false,
 *          nullable=false,
 *          type="string",
 *      ),
 *      @OA\Property(
 *          property="remember_token",
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
 */class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes, HasPermissions;
    public $table = 'users';

    public $hidden = ['password'];

    public $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token'
    ];

    protected $casts = [
        'name' => 'string',
        'email' => 'string',
        'email_verified_at' => 'datetime',
        'password' => 'string',
        'remember_token' => 'string'
    ];

    public static array $rules = [
        'name' => 'required|string|max:255',
        'email' => 'required|string|max:255',
        'email_verified_at' => 'nullable',
        'remember_token' => 'nullable|string|max:100',
        'deleted_at' => 'nullable',
        'created_at' => 'nullable',
        'updated_at' => 'nullable'
    ];

    public function initialRequisitions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\InitialRequisition::class, 'user_id');
    }

    public function branches(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Branch::class, 'user_branches');
    }

    public function departments(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Department::class, 'user_departments');
    }

    public function designations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Designation::class, 'user_designations');
    }

    public function organizations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Organization::class, 'user_organizations');
    }
}
