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

class WhatsAppAccountNotification extends Notification
{
    use Queueable;

    public string $to;
    public QuickReplyButton $approve;
    public QuickReplyButton $reject;
    public UrlButton $viewButton;
    public Component $name;
    public Component $prno;

    /**
     * Create a new notification instance.
     */
    public function __construct(Component $name, Component $prno, $approve, $reject, UrlButton $viewButton, string $to)
    {
        $this->name = $name;
        $this->prno = $prno;
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
            ->name('inventory_department_notification')
            ->body($this->name)
            ->body($this->prno)
            ->buttons($this->approve)
            ->buttons($this->reject)
            ->buttons($this->viewButton)
            ->to($this->to);
    }
}
