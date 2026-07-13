<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    protected $table = 'whatsapp_messages';

    protected $fillable = [
        'webhook_log_id',
        'wa_message_id',
        'from_phone',
        'to_phone',
        'type',
        'text',
        'status_event',
        'contact_name',
        'payload',
        'msg_timestamp',
    ];

    protected $casts = [
        'payload' => 'array',
        'msg_timestamp' => 'datetime',
    ];

    public function webhookLog(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(WhatsAppWebhookLog::class, 'webhook_log_id');
    }
}
