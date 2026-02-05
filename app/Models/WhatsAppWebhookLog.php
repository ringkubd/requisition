<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppWebhookLog extends Model
{
    protected $table = 'whatsapp_webhook_logs';

    protected $fillable = [
        'payload',
        'headers',
        'method',
        'path',
        'signature',
    ];

    protected $casts = [
        'payload' => 'array',
        'headers' => 'array',
    ];
}
