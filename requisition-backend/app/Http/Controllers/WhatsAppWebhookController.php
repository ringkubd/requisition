<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request){
        Log::error('whatsapp_response', ['response' => $request->all()]);
        if ($request->has('hub_verify_token') && $request->hub_verify_token === env('WHATSAPP_WEBHOOK_VERIFICATION_TOKEN')){
            return $request->hub_challenge;
        }
    }
}
