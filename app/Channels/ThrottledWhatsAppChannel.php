<?php

namespace App\Channels;

use App\Helper\WhatsappRateLimiter;
use Illuminate\Notifications\Notification;
use NotificationChannels\WhatsApp\WhatsAppChannel;

class ThrottledWhatsAppChannel
{
    public function send($notifiable, Notification $notification): void
    {
        $message = $notification->toWhatsApp($notifiable);
        $phone = $message?->to ?? $notification->to ?? null;

        if (!empty($phone) && !WhatsappRateLimiter::allow($phone)) {
            return;
        }

        app(WhatsAppChannel::class)->send($notifiable, $notification);

        if (!empty($phone)) {
            WhatsappRateLimiter::markSent($phone);
        }
    }
}
