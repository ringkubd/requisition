<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use stdClass;

class WhatsAppWebhookController extends Controller
{
    public stdClass $messages;

    public function verify(Request $request)
    {
        Storage::put("whatsapp_".rand(1,999999999).'.txt', json_encode($request->all()));
        if ($request->isMethod('GET') && $request->has('hub_verify_token') && $request->hub_verify_token == "verification_token") {
            return $request->hub_challenge;
        }
        $validity = $this->verifySignature($request);
        if ($validity){
            $message = $this->messages($request->entry);
            Log::info(json_encode($message));
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
        if (!empty($entry)){
            $firstEntry = collect($entry[0]);
            $this->messages->id = $firstEntry['id'];
            $this->messages->changes = $firstEntry['changes'];
            $this->messages->first_change = collect($this->messages->changes[0]);
            $this->messages->message_value = collect($this->messages->first_change->value);
            $this->messages->metadata = $this->messages->message_value->metadata;
            $this->messages->contacts = $this->messages->message_value->contacts;
            $this->messages->messages = $this->messages->message_value->messages;
            $this->messages->first_message = collect($this->messages->messages[0]);
            $this->messages->message_type = $this->messages->first_message->type;
            $this->messages->context = $this->messages->first_message->context;
            $this->messages->from = $this->messages->first_message->from;
            $this->messages->timestamp = $this->messages->first_message->timestamp;
            $this->messages->button = $this->messages->first_message?->button;
        }
        return $this->messages;
    }
}
