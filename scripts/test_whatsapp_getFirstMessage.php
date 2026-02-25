<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Http\Controllers\API\WhatsAppWebhookLogAPIController;

$payload = json_decode(<<<'JSON'
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "139298655937534",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "8801747784185",
              "phone_number_id": "153993901126186"
            },
            "statuses": [
              {
                "id": "wamid.HBgNODgwMTg1NjY4MzY1NxUCABEYEjEwMjc5NEZENDgzNUY5MTZFRgA=",
                "status": "read",
                "timestamp": "1770534264",
                "recipient_id": "8801856683657",
                "conversation": {
                  "id": "45384546898079587fabf463eda78689",
                  "origin": {
                    "type": "utility"
                  }
                },
                "pricing": {
                  "billable": true,
                  "pricing_model": "PMP",
                  "category": "utility",
                  "type": "regular"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
JSON
, true);

$controller = new WhatsAppWebhookLogAPIController();

$rc = new ReflectionClass($controller);
$method = $rc->getMethod('getFirstMessage');
$method->setAccessible(true);

$result = $method->invoke($controller, $payload);

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
