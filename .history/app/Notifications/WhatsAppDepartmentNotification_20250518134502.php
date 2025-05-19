<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WhatsApp\Component\Component;
use NotificationChannels\WhatsApp\Component\QuickReplyButton;
use NotificationChannels\WhatsApp\Component\UrlButton;
use NotificationChannels\WhatsApp\WhatsAppChannel;
use NotificationChannels\WhatsApp\WhatsAppTemplate;

class WhatsAppDepartmentNotification extends Notification
{
    use Queueable;

    public Component $body;
    public string $to;
    public QuickReplyButton $approve;
    public QuickReplyButton $reject;
    public UrlButton $viewButton;

    /**
     * Create a new notification instance.
     */
    public function __construct(Component $body, string $to, UrlButton $viewButton, $approve, $reject)
    {
        $this->body = $body;
        $this->to = $to;
        $this->approve = $approve;
        $this->reject = $reject;
        $this->viewButton = $viewButton;
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
            ->name('inventory_approval_notice')
            ->body($this->body)
            ->buttons($this->approve)
            ->buttons($this->reject)
            ->buttons($this->viewButton)
            ->to($this->to);
    }
}
