<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request){
        Log::error('whatsapp_response', ['message' => json_encode($request->entry)]);
        if ($request->isMethod('GET') && $request->has('hub_verify_token') && $request->hub_verify_token == "verification_token"){
            return $request->hub_challenge;
        }
    }
}
