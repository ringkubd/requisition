<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;

class WhatsAppChannel
{
    public function send(object $notifiable, Notification $notification) : void
    {
        $message = $notification->toWhatsAPP($notifiable);
    }
}
