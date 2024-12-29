<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class PRFNo extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];
}
