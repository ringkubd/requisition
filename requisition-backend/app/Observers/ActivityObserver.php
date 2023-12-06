<?php

namespace App\Observers;

use App\Events\ActivityEvent;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity as ActivityLog;

class ActivityObserver
{
    /**
     * Handle the activity log "created" event.
     *
     * @param  ActivityLog  $activityLog
     * @return void
     */
    public function created(ActivityLog $activityLog): void
    {
        //
        broadcast(new ActivityEvent($activityLog));
    }

    /**
     * Handle the activity log "updated" event.
     *
     * @param  ActivityLog  $activityLog
     * @return void
     */
    public function updated(ActivityLog $activityLog): void
    {
        broadcast(new ActivityEvent($activityLog));
    }

    /**
     * Handle the activity log "deleted" event.
     *
     * @param  ActivityLog  $activityLog
     * @return void
     */
    public function deleted(ActivityLog $activityLog): void
    {
        broadcast(new ActivityEvent($activityLog));
    }

    /**
     * Handle the activity log "restored" event.
     *
     * @param  ActivityLog  $activityLog
     * @return void
     */
    public function restored(ActivityLog $activityLog): void
    {
        broadcast(new ActivityEvent($activityLog));
    }

    /**
     * Handle the activity log "force deleted" event.
     *
     * @param  ActivityLog  $activityLog
     * @return void
     */
    public function forceDeleted(ActivityLog $activityLog): void
    {
        broadcast(new ActivityEvent($activityLog));
    }
}
