<?php

namespace App\Http\Controllers;

use App\Models\CashRequisition;
use App\Models\PurchaseRequisition;
use App\Models\User;
use App\Notifications\PushNotification;
use App\Notifications\RequisitionStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use stdClass;

class WhatsAppWebhookController extends Controller
{
    public stdClass $messages;

    public function verify(Request $request)
    {
        Storage::put("whatsapp_" . rand(1, 999999999) . '.txt', json_encode($request->all()));
        if ($request->isMethod('GET') && $request->has('hub_verify_token') && $request->hub_verify_token == "verification_token") {
            return $request->hub_challenge;
        }
        $validity = $this->verifySignature($request);
        $notifiedUsers = [];
        if ($validity) {
            $message = $this->messages(json_decode(json_encode($request->entry), true));
            if ($message->message_type == "button") {
                $payload = explode('_', $message->button['payload']);
                Log::info($message->button['payload']);
                $requisition_id = $payload[0];
                $requisitor_id = $payload[1];
                $status = $payload[2];
                $stage = $payload[3] ?? 'ceo';
                $type = $payload[4] ?? 'purchase';
                Log::info($payload);
                if ($type == 'purchase') {
                    $requisition = PurchaseRequisition::find($requisition_id);
                    if ($requisition->approval_status) {
                        $update = $requisition->approval_status()->update([
                            'ceo_status' => $status,
                            'ceo_approved_at' => now()
                        ]);
                    } else {
                        $update = $requisition->approval_status()->updateOrCreate([
                            'ceo_status' => $status,
                            'ceo_approved_at' => now()
                        ]);
                    }
                }
                if ($type == "cash") {
                    $requisition = CashRequisition::find($requisition_id);
                    if ($requisition->approval_status) {
                        $update = $requisition->approval_status()->update([
                            'ceo_status' => $status,
                            'ceo_approved_at' => now()
                        ]);
                    } else {
                        $update = $requisition->approval_status()->updateOrCreate([
                            'ceo_status' => $status,
                            'ceo_approved_at' => now()
                        ]);
                    }
                }

                if ($update) {
                    $notifiedUsers[] = $requisition->user;
                    $notifiedUsers[] = User::query()
                        ->whereHas('roles', function ($q) {
                            $q->where('name', 'Store Manager');
                        })
                        ->first();
                    foreach ($notifiedUsers as $notifiedUser) {
                        $requisitor = $requisition->user->name;
                        $notifiedUser->notify(new PushNotification(
                            "A purchase requisition has been generated and for your approval.",
                            "$requisitor is generated an requisition P.R. NO. $requisition->prf_no against I.R.F. NO. $requisition->irf_no. Please review and approve.",
                            $requisition
                        ));
                        $notifiedUser->notify(new RequisitionStatusNotification($requisition));
                    }
                }
            }
        }
    }

    private function verifySignature(Request $request): bool
    {
        $body = $request->getContent();
        $requestHash = 'sha256=' . hash_hmac('sha256', $body, config('services.whatsapp.app_secret'));

        if (!hash_equals($requestHash, $request->header('X-Hub-Signature-256'))) {
            return false;
        }

        return true;
    }

    /**
     * @param $entry
     * @return stdClass
     */

    private function messages($entry): stdClass
    {

        if (!empty($entry)) {
            $firstEntry = collect($entry[0]);
            $this->messages = new stdClass();
            $this->messages->id = $firstEntry['id'];
            $this->messages->changes = $firstEntry['changes'];
            $this->messages->first_change = collect($this->messages->changes[0]);
            $this->messages->message_value = collect($this->messages->first_change['value']);
            $this->messages->metadata = $this->messages->message_value['metadata'] ?? [];
            $this->messages->contacts = $this->messages->message_value['contacts'] ?? [];
            $this->messages->messages = $this->messages->message_value['messages'] ?? [];
            $this->messages->first_message = collect($this->messages->messages[0] ?? []) ?? [];
            $this->messages->message_type = $this->messages->first_message['type'] ?? '';
            $this->messages->context = $this->messages->first_message['context'] ?? "";
            $this->messages->from = $this->messages->first_message['from'] ?? "";
            $this->messages->timestamp = $this->messages->first_message['timestamp'] ?? "";
            $this->messages->button = $this->messages->first_message['button'] ?? [];
        }
        return $this->messages;
    }
}
