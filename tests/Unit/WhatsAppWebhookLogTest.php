<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Controllers\API\WhatsAppWebhookLogAPIController;

class WhatsAppWebhookLogTest extends TestCase
{
    public function test_getFirstMessage_handles_statuses_and_returns_recipient_id()
    {
        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [
                [
                    'id' => '139298655937534',
                    'changes' => [
                        [
                            'value' => [
                                'messaging_product' => 'whatsapp',
                                'metadata' => [
                                    'display_phone_number' => '8801747784185',
                                    'phone_number_id' => '153993901126186',
                                ],
                                'statuses' => [
                                    [
                                        'id' => 'wamid.test',
                                        'status' => 'read',
                                        'timestamp' => '1770534264',
                                        'recipient_id' => '8801856683657',
                                    ],
                                ],
                            ],
                            'field' => 'messages',
                        ],
                    ],
                ],
            ],
        ];

        $controller = new WhatsAppWebhookLogAPIController();
        $rc = new \ReflectionClass($controller);
        $method = $rc->getMethod('getFirstMessage');
        $method->setAccessible(true);

        $result = $method->invoke($controller, $payload);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('recipient_id', $result);
        $this->assertEquals('8801856683657', $result['recipient_id']);
        $this->assertStringContainsString('status: read', $result['text']);
    }
}
