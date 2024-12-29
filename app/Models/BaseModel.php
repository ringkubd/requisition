<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class BaseModel extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        // TODO: Implement getActivitylogOptions() method.
        $model  = get_class($this);
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn(string $eventName) => "The model has been {$eventName}")
            ->logFillable();
    }
}
