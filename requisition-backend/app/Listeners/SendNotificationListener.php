<?php

namespace App\Listeners;

use App\Events\RequisitionStatusEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Queue\InteractsWithQueue;

class SendNotificationListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    public function handleRequisitionStatusUpdateEvent(RequisitionStatusEvent $event)
    {

    }

    public function subscribe(Dispatcher $dispatcher): array
    {
        return [
            RequisitionStatusEvent::class => 'handleRequisitionStatusUpdateEvent'
        ];
    }
}
