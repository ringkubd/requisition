<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Hash;

class OneTimeLogin extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];
    protected $table="one_time_logins";

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param $userID
     * @return mixed
     */
    public function generate($userID): mixed
    {
        $invalidAt = now()->addHour(48)->toDateTimeString();
        $auth_key = Hash::make(now());
        return $this->create([
            'user_id' => $userID,
            'auth_key' => $auth_key,
            'invalid_at' => $invalidAt
        ]);
    }
}
