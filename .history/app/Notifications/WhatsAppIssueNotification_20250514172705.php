<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WhatsApp\Component\Component;
use NotificationChannels\WhatsApp\WhatsAppChannel;
use NotificationChannels\WhatsApp\WhatsAppTemplate;

class WhatsAppIssueNotification extends Notification
{
    use Queueable;


    public Component $name;
    public Component $no;
    public string $to;

    /**
     * Create a new notification instance.
     */
    public function __construct(Component $name, Component $no, string $to)
    {
        $this->name = $name;
        $this->no = $no;
        $this->to = $to;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WhatsAppChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toWhatsApp(object $notifiable)
    {
        return WhatsAppTemplate::create()
            ->language('en')
            ->name('inventory_issue_notification')
            ->body($this->name)
            ->body($this->no)
            ->to($this->to);
    }
}
