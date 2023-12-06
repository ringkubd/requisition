<?php

namespace App\Helper;

use Spatie\Activitylog\LogOptions;

trait ActivityLog
{
    use \Spatie\Activitylog\Traits\LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable);
        // Chain fluent methods for configuration options
    }

}
