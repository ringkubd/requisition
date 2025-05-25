<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
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
    public Component $department;

    /**
     * Create a new notification instance.
     */
    public function __construct(Component $department, Component $name, Component $prno, $approve, $reject, UrlButton $viewButton, string $to)
    {
        $this->name = $name;
        $this->prno = $prno;
        $this->to = $to;
        $this->approve = $approve;
        $this->reject = $reject;
        $this->viewButton = $viewButton;
        $this->department = $department;
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
        Log::info('WhatsAppAccountNotification toWhatsApp called', [
            'to' => $this->to,
            'department' => $this->department,
            'name' => $this->name,
            'prno' => $this->prno,
        ]);
        return WhatsAppTemplate::create()
            ->language('en')
            ->name('inventory_notification_accounts')
            ->body($this->department)
            ->body($this->prno)
            ->body($this->name)
            ->buttons($this->approve)
            ->buttons($this->reject)
            ->buttons($this->viewButton)
            ->to($this->to);
    }
}
