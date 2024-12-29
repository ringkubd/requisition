<?php

namespace App\Channels;
use Illuminate\Notifications\Notification;

class RequisitionStatusChannel
{
    public function send($notifiable, Notification $notification)
    {
        $message = $notification->toNotify($notifiable);
    }
}
