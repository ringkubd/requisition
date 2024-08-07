<?php

namespace App\Notifications;

use App\Models\CashRequisition;
use App\Models\OneTimeLogin;
use App\Models\PurchaseRequisition;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CeoMailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public PurchaseRequisition|CashRequisition $requisition;

    /**
     * Create a new notification instance.
     */
    public function __construct($requisition)
    {
        $this->requisition = $requisition;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $one_time_key = new OneTimeLogin();
        $key = $one_time_key->generate($notifiable->id);
        $requisition = $this->requisition;
        $requisition_type = 'purchase';
        if ($requisition instanceof CashRequisition){
            $requisition_type = "cash";
        }
        $message = "A requisition has been submitted for your approval.";
        $requisitor = $requisition->user;
        $frontend_url = config('app.frontend_url');
        return (new MailMessage)
            ->from('inventory@isdb-bisew.org', config('app.name'))
            ->subject("A requisition is waiting for your approval.")
            ->line("$message")
            ->line("Requisitor Name: $requisitor->name ")
            ->line("P.R. No.: $requisition->prf_no")
            ->action('View', "$frontend_url/$requisition_type-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
