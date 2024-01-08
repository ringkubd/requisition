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

    public function sendMessageTemplate($document_link, $fileName, $groupName='it'){
        $whatsapp_api =  '';
        $whatsapp_api_token =  '';
        $last60day_new_problem = $document_link;
        $notification_contacts = [];
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
    "to": "'.$c->whatsapp.'",
    "type": "template",
    "template": {
        "name": "bcs_computer_city_utility_report",
        "language": {
            "code": "en"
        },
        "components": [
            {
                "type": "header",
                "parameters": [
                    {
                        "type": "document",
                        "document": {
                            "link": "'.$last60day_new_problem.'",
                            "filename": "'.$fileName.'"
                        }
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
