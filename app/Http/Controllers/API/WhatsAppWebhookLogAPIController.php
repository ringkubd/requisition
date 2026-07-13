<?php

namespace App\Http\Controllers\API;

use App\Channels\ThrottledWhatsAppChannel;
use App\Http\Controllers\AppBaseController;
use App\Models\User;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppWebhookLog;
use App\Notifications\WhatsAppCommonNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use NotificationChannels\WhatsApp\Component\Component;

class WhatsAppWebhookLogAPIController extends AppBaseController
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_whatsapp_webhooks', ['only' => ['index', 'show', 'conversations', 'messages']]);
        $this->middleware('role_or_permission:Super Admin|send_whatsapp_message', ['only' => ['send']]);
    }

    /**
     * List webhook logs with filters
     *
     * Filters: date_from, date_to, method, phone, q (search), per_page
     */
    public function index(Request $request)
    {
        $query = WhatsAppWebhookLog::query();

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('method')) {
            $query->where('method', $request->method);
        }

        if ($request->filled('phone')) {
            // Simple text search inside JSON payload for phone
            $query->where('payload', 'like', '%' . $request->phone . '%');
        }

        if ($request->filled('q')) {
            $query->where('payload', 'like', '%' . $request->q . '%');
        }

        $perPage = (int) ($request->per_page ?? 15);

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Add brief extracted info for each log
        $logs->getCollection()->transform(function (WhatsAppWebhookLog $log) {
            $payload = $log->payload ?? [];
            $firstMessage = $this->getFirstMessage($payload);

            return [
                'id' => $log->id,
                'method' => $log->method,
                'path' => $log->path,
                'signature' => $log->signature,
                'from' => $firstMessage['from'] ?? null,
                // Recipient (prefers recipient_id, then derived recipient_number, then any 'to' or 'wa_id')
                'recipient' => $firstMessage['recipient_id'] ?? $firstMessage['recipient_number'] ?? $firstMessage['to'] ?? $firstMessage['wa_id'] ?? null,
                'message_type' => $firstMessage['type'] ?? null,
                'message_preview' => isset($firstMessage['text']) ? mb_strimwidth($firstMessage['text'], 0, 200, '...') : null,
                'created_at' => $log->created_at->toDateTimeString(),
            ];
        });

        return $this->sendResponse($logs, 'Webhook logs retrieved successfully');
    }

    /**
     * Show a single webhook log with message-by-message breakdown
     */
    public function show($id)
    {
        $log = WhatsAppWebhookLog::find($id);
        if (!$log) {
            return $this->sendError('Webhook log not found', 404);
        }

        $messages = $this->extractMessages($log->payload ?? []);

        return $this->sendResponse([
            'log' => $log,
            'messages' => $messages,
        ], 'Webhook log retrieved successfully');
    }

    /**
     * Get conversations (unique contacts grouped by phone)
     */
    public function conversations(Request $request)
    {
        $search = $request->search;
        $limit = (int) ($request->limit ?? 50);

        $query = WhatsAppMessage::query()
            ->selectRaw('COALESCE(contact_name, from_phone) as display_name, from_phone as phone')
            ->selectRaw('MAX(text) as last_message')
            ->selectRaw('MAX(msg_timestamp) as last_message_at')
            ->selectRaw('MAX(CASE WHEN type != \'status\' THEN type END) as last_message_type')
            ->whereNotNull('from_phone')
            ->where('from_phone', '!=', '');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('from_phone', 'like', '%' . $search . '%')
                  ->orWhere('contact_name', 'like', '%' . $search . '%')
                  ->orWhere('text', 'like', '%' . $search . '%');
            });
        }

        $contacts = $query->groupBy('from_phone', 'contact_name')
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get()
            ->map(function ($row) {
                return [
                    'phone' => $row->phone,
                    'name' => $row->display_name ?? $row->phone,
                    'last_message' => $row->last_message,
                    'last_message_at' => $row->last_message_at ? date('c', strtotime($row->last_message_at)) : null,
                    'last_message_type' => $row->last_message_type,
                    'unread' => 0,
                ];
            });

        return $this->sendResponse($contacts, 'Conversations retrieved successfully');
    }

    /**
     * Get messages for a specific phone number
     */
    public function messages(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $phone = $request->phone;
        $page = (int) ($request->page ?? 1);
        $perPage = (int) ($request->per_page ?? 50);

        $query = WhatsAppMessage::query()
            ->where(function ($q) use ($phone) {
                $q->where('from_phone', $phone)
                  ->orWhere('to_phone', $phone);
            })
            ->orderBy('msg_timestamp', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        $messages = $query->map(function ($msg) use ($phone) {
            $isOutbound = $msg->from_phone !== $phone;
            $isStatus = $msg->type === 'status';

            return [
                'id' => $msg->wa_message_id ?? 'msg_' . $msg->id,
                'from' => $msg->from_phone,
                'to' => $msg->to_phone,
                'text' => $msg->text,
                'type' => $msg->type,
                'timestamp' => $msg->msg_timestamp ? $msg->msg_timestamp->timestamp : $msg->created_at->timestamp,
                'direction' => $isOutbound ? 'outbound' : 'inbound',
                'contact_name' => $msg->contact_name,
                'log_id' => $msg->webhook_log_id,
                'created_at' => $msg->created_at->toDateTimeString(),
            ];
        });

        return $this->sendResponse([
            'messages' => $messages->values(),
            'total' => $query->total(),
            'page' => $page,
            'per_page' => $perPage,
        ], 'Messages retrieved successfully');
    }

    /**
     * Send a WhatsApp message to a phone number
     */
    public function send(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        try {
            $user = $request->user();

            $user->notify(new WhatsAppCommonNotification(
                Component::text($request->message),
                $request->phone
            ));

            // Log the outbound message to whatsapp_messages too
            WhatsAppMessage::create([
                'from_phone' => 'System',
                'to_phone' => $request->phone,
                'type' => 'text',
                'text' => $request->message,
                'msg_timestamp' => now(),
            ]);

            WhatsAppWebhookLog::create([
                'payload' => [
                    'sent_to' => $request->phone,
                    'message' => $request->message,
                    'sent_by' => $user->id,
                    'sent_by_name' => $user->name,
                ],
                'method' => 'OUTBOUND',
                'path' => 'manual_send',
                'headers' => [],
            ]);

            return $this->sendResponse([], 'Message sent successfully');
        } catch (\Exception $e) {
            Log::error('WhatsApp send failed', ['error' => $e->getMessage()]);
            return $this->sendError('Failed to send message: ' . $e->getMessage(), 500);
        }
    }
}
