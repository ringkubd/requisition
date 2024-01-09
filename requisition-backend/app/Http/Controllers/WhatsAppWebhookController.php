<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request){
        Log::error('whatsapp_response', ['response' => $request->all()]);
        Log::info( $request->hub_verify_token);
        Log::info( env('WHATSAPP_WEBHOOK_VERIFICATION_TOKEN'));
        if ($request->has('hub_verify_token') && $request->hub_verify_token == "verification_token"){
            Log::info($request->hub_challenge);
            return $request->hub_challenge;
        }
    }
}
