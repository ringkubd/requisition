<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequisitionStatus extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];


    public function getCurrentStatusAttribute(): array
    {
        $department_status = match ($this->department_status) {
            1 => 'Pending',
            2 => 'Approved',
            3 => 'Rejected',
            4 => 'Change',
            default => 'Not arrived',
        };
        if ($department_status != 'Approved'){
            return ['stage' => 'department', 'status' => $department_status];
        }
        $accounts_status = match ($this->accounts_status) {
            0 => $this->department_status == 2 ? 'Pending' : 'Not arrived',
            1 => 'Pending',
            2 => 'Approved',
            3 => 'Rejected',
            4 => 'Change',
            default => 'Not arrived',
        };
        if ($accounts_status != 'Approved'){
            return ['stage' => 'accounts', 'status' => $accounts_status];
        }
        $ceo_status = match ($this->ceo_status) {
            1 => 'Pending',
            2 => 'Approved',
            3 => 'Rejected',
            4 => 'Change',
            default => 'Not arrived',
        };
        return ['stage' => 'ceo', 'status' => $ceo_status];
    }

    public function requisition(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo('requisition');
    }
}
