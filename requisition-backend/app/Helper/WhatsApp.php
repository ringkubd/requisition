<?php

namespace App\Helper;

use Illuminate\Support\Facades\Log;

class WhatsApp
{
    public function sendMessage($document_link, $fileName)
    {
        $whatsapp_api = '';
        $whatsapp_api_token = '';

        $notification_contacts = [];
        foreach ($notification_contacts as $c) {
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $whatsapp_api,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "' . $c->whatsapp . '",
    "type": "document",
    "document": {
        "link": "' . $document_link . '",
        "filename": "' . $fileName . '"
    },
    "text": {
    "body":  "The daily report attached here."
    }
}',
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    "Authorization: Bearer $whatsapp_api_token"
                ),
            ));
            $response = curl_exec($curl);
            Log::info($response);
            $err = curl_error($curl);
            Log::error($err);

            curl_close($curl);
        }
    }

    public function sendMessageTemplate($notification_contacts, $message){
        $whatsapp_api =  '';
        $whatsapp_api_token =  '';
        $log = [];
        foreach ($notification_contacts as $c){
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $whatsapp_api,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS =>'{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "preview_url": true,
    "to": "'.$c->mobile_no.'",
    "type": "template",
    "template": {
        "name": "inventory_approval_notice_2",
        "language": {
            "code": "en"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text: $message
                    }
                ]
            }, {
                "type": "button",
                "index": 0,
                "sub_type": "url",
                "parameters": [
                    {
                        "type": "text",
                        "text: $message
                    }
                ]
            }
        ]
    }
}',
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    "Authorization: Bearer $whatsapp_api_token"
                ),
            ));
            $response = curl_exec($curl);
            Log::info($response);
            $log[]['response'] = $response;
            $err = curl_error($curl);
            Log::error($err);
            $log[]['error'] = $err;

            curl_close($curl);
        }
    }
}
