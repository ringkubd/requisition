<?php

namespace App\Notifications;

use App\Channels\RequisitionStatusChannel;
use App\Models\CashRequisition;
use App\Models\InitialRequisition;
use App\Models\OneTimeLogin;
use App\Models\PurchaseRequisition;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequisitionStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $requisition;

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
        $proNo = "P.R. No.: $requisition->prf_no ";
        if ($requisition instanceof CashRequisition){
            $requisition_type = "cash";
        }elseif ($requisition instanceof InitialRequisition){
            $proNo = "I.R. No.: $requisition->irf_no ";
            $requisition_type = "initial";
        }
        $message = "A requisition has been submitted for your approval.";
        if ($notifiable->hasRole('Store Manager')){
            $message = "A requisition has been submitted and approved by the authority.";
        }
        if ($requisition->user->id === $notifiable->id && $requisition->approval_status?->ceo_status == 2){
            $message = "Your requisition is approved by the authority. Please contact with Procurement Officer.";
        }

        $requisitor = $requisition->user;
        $frontend_url = config('app.frontend_url');

        return (new MailMessage)
            ->from('inventory@isdb-bisew.org', config('app.name'))
            ->line("$message")
            ->line("Requisitor Name: $requisitor->name ")
            ->line($proNo)
            ->action('View', "$frontend_url/$requisition_type-requisition/$requisition->id/whatsapp_view?auth_key=$key->auth_key");
    }
}
