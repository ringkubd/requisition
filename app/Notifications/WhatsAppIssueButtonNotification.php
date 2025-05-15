<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WhatsApp\Component\QuickReplyButton;
use NotificationChannels\WhatsApp\WhatsAppChannel;
use NotificationChannels\WhatsApp\WhatsAppTemplate;
use NotificationChannels\WhatsApp\Component\Component;
use NotificationChannels\WhatsApp\Component\UrlButton;

class WhatsAppIssueButtonNotification extends Notification
{
    use Queueable;

    public Component $name;
    public Component $no;
    public QuickReplyButton $recommended_url;
    public QuickReplyButton $reject_url;
    public UrlButton $view_url;
    public string $to;
    public string $message;
    public string $url;
    public string $button;
    /**
     * Create a new notification instance.
     */
    public function __construct(Component $name, Component $no, QuickReplyButton $recommended_url, QuickReplyButton $rejected_url, UrlButton $view_url, string $to)
    {
        $this->name = $name;
        $this->no = $no;
        $this->recommended_url = $recommended_url;
        $this->reject_url = $rejected_url;
        $this->view_url = $view_url;
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

    public function toWhatsApp(object $notifiable)
    {
        return WhatsAppTemplate::create()
            ->language('en')
            ->name('inventory_issue_notification_with_button')
            ->body($this->name)
            ->body($this->no)
            ->buttons($this->recommended_url)
            ->buttons($this->reject_url)
            ->buttons($this->view_url)
            ->to($this->to);
    }
}
