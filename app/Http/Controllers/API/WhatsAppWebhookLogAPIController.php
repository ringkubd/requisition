<?php

namespace App\Http\Controllers\API;

use App\Channels\ThrottledWhatsAppChannel;
use App\Http\Controllers\AppBaseController;
use App\Models\User;
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

        $logs = WhatsAppWebhookLog::query()
            ->when($search, function ($q) use ($search) {
                $q->where('payload', 'like', '%' . $search . '%');
            })
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $contacts = [];
        foreach ($logs as $log) {
            $payload = $log->payload ?? [];
            $firstMsg = $this->getFirstMessage($payload);
            $phone = $firstMsg['from'] ?? $firstMsg['to'] ?? $firstMsg['recipient_id'] ?? 'unknown';

            if ($phone === 'unknown') continue;

            // Find contact name from the payload contacts array
            $contactName = null;
            $contactsArr = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value', 'contacts']);
            if (is_array($contactsArr)) {
                foreach ($contactsArr as $c) {
                    $cPhone = $c['wa_id'] ?? null;
                    if ($cPhone === $phone || !$contactName) {
                        $name = $c['profile']['name'] ?? $c['name']['formatted_name'] ?? null;
                        if ($name) $contactName = $name;
                    }
                }
            }

            $key = $phone;
            if (!isset($contacts[$key]) || $log->created_at->gt($contacts[$key]['last_message_at'])) {
                $contacts[$key] = [
                    'phone' => $phone,
                    'name' => $contactName ?? $phone,
                    'last_message' => $firstMsg['text'] ?? null,
                    'last_message_at' => $log->created_at->toDateTimeString(),
                    'last_message_type' => $firstMsg['type'] ?? null,
                    'unread' => 0,
                ];
            }
        }

        $values = array_values($contacts);
        usort($values, fn($a, $b) => strtotime($b['last_message_at']) - strtotime($a['last_message_at']));
        $values = array_slice($values, 0, $limit);

        return $this->sendResponse($values, 'Conversations retrieved successfully');
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

        $logs = WhatsAppWebhookLog::query()
            ->where('payload', 'like', '%' . $phone . '%')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $allMessages = [];
        foreach ($logs as $log) {
            $msgList = $this->extractMessages($log->payload ?? []);
            foreach ($msgList as $m) {
                $matched = false;
                foreach (['from', 'to', 'recipient_number'] as $field) {
                    if (isset($m[$field]) && str_contains($m[$field], $phone)) {
                        $matched = true;
                        break;
                    }
                }
                if (!$matched && empty($m['from']) && empty($m['to'])) {
                    continue;
                }
                $allMessages[] = [
                    'id' => $m['id'] ?? 'log_' . $log->id,
                    'from' => $m['from'] ?? null,
                    'to' => $m['to'] ?? $m['recipient_number'] ?? null,
                    'text' => $m['text'] ?? null,
                    'type' => $m['type'] ?? null,
                    'timestamp' => $m['timestamp'] ?? $log->created_at->toDateTimeString(),
                    'direction' => $this->isOutbound($m, $log) ? 'outbound' : 'inbound',
                    'log_id' => $log->id,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            }

            // Also include outbound logs sent to this number
            if ($log->method === 'OUTBOUND') {
                $payload = $log->payload ?? [];
                $sentTo = $payload['sent_to'] ?? null;
                $sentMsg = $payload['message'] ?? null;
                if ($sentTo && str_contains($sentTo, $phone)) {
                    $allMessages[] = [
                        'id' => 'out_' . $log->id,
                        'from' => 'System',
                        'to' => $sentTo,
                        'text' => $sentMsg,
                        'type' => 'text',
                        'timestamp' => $log->created_at->toDateTimeString(),
                        'direction' => 'outbound',
                        'log_id' => $log->id,
                        'created_at' => $log->created_at->toDateTimeString(),
                    ];
                }
            }
        }

        usort($allMessages, fn($a, $b) => strtotime($a['timestamp']) - strtotime($b['timestamp']));

        return $this->sendResponse([
            'messages' => array_values($allMessages),
            'total' => count($allMessages),
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

    /**
     * Determine if a message is outbound based on log method and payload
     */
    private function isOutbound(array $message, WhatsAppWebhookLog $log): bool
    {
        if ($log->method === 'OUTBOUND') return true;

        $payload = $log->payload ?? [];
        $metadata = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value', 'metadata']);
        $ourPhoneId = $metadata['phone_number_id'] ?? null;

        if ($ourPhoneId && isset($message['to']) && $message['to'] === $ourPhoneId) {
            return true; // message was sent TO us, so it's inbound from our perspective
        }

        return false;
    }

    /**
     * Extract the first message summary from payload
     */
    private function getFirstMessage(array $payload): array
    {
        // Navigate common webhook structure: entry -> changes -> value -> messages/statuses
        $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
        $messages = (array) ($this->safeGet($value, ['messages']) ?? []);
        $first = $messages[0] ?? null;

        // If no messages found, check for statuses (delivery/read receipts) or top-level messages
        if (!$first) {
            $first = $this->safeGet($value, ['statuses', 0]) ?? $payload['messages'][0] ?? null;
        }

        if (!$first) return [];

        // Determine type (statuses use 'status' key, messages often have 'type')
        $type = $first['type'] ?? (isset($first['status']) ? 'status' : null);
        $from = $first['from'] ?? $first['author'] ?? null;
        $recipient_id = $first['recipient_id'] ?? $first['to'] ?? $first['wa_id'] ?? ($value['metadata']['phone_number_id'] ?? null);
        $to = $recipient_id;
        $timestamp = $first['timestamp'] ?? null;

        // Try many places for text/preview depending on message type
        $text = null;
        if ($type && isset($first[$type]) && is_array($first[$type])) {
            $possible = $first[$type];
            $text = $possible['body'] ?? $possible['caption'] ?? null;
        }
        $text = $text ?? ($first['text']['body'] ?? null);
        $text = $text ?? ($first['button']['text'] ?? $first['button']['payload'] ?? null);
        $text = $text ?? ($first['interactive']['button_reply']['id'] ?? $first['interactive']['button_reply']['title'] ?? null);

        // If it's a status-type webhook, include a status preview
        if (!$text && isset($first['status'])) {
            $text = 'status: ' . $first['status'];
        }

        return [
            'type' => $type,
            'from' => $from,
            'to' => $to,
            'recipient_id' => $recipient_id,
            'timestamp' => $timestamp,
            'text' => $text,
            'raw' => $first,
        ];
    }

    /**
     * Extract messages list from payload with normalized fields
     */
    private function extractMessages(array $payload): array
    {
        $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
        $messages = (array) ($this->safeGet($value, ['messages']) ?? []);

        // Also include statuses or other message-like objects if present
        if (empty($messages) && isset($value['statuses'])) {
            $messages = $value['statuses'];
        }

        if (empty($messages) && isset($payload['messages'])) {
            $messages = $payload['messages'];
        }

        // Try to derive a human-friendly recipient number from metadata if available
        $recipient_number = null;
        if (is_array($value) && isset($value['metadata'])) {
            $recipient_number = $value['metadata']['display_phone_number'] ?? $value['metadata']['phone_number'] ?? $value['metadata']['phone_number_id'] ?? null;
        }

        $result = [];
        foreach ($messages as $m) {
            $type = $m['type'] ?? null;
            $from = $m['from'] ?? $m['author'] ?? null;
            $to = $m['to'] ?? $m['recipient_id'] ?? $m['wa_id'] ?? null;
            $timestamp = $m['timestamp'] ?? null;
            $text = null;

            if ($type && isset($m[$type])) {
                $candidate = $m[$type];
                if (is_array($candidate)) {
                    $text = $candidate['body'] ?? $candidate['caption'] ?? null;
                } elseif (is_string($candidate)) {
                    $text = $candidate;
                }
            }

            if (!$text && isset($m['text']['body'])) {
                $text = $m['text']['body'];
            }
            if (!$text && isset($m['button']['text'])) {
                $text = $m['button']['text'];
            }
            if (!$text && isset($m['interactive']['button_reply'])) {
                $text = $m['interactive']['button_reply']['title'] ?? $m['interactive']['button_reply']['id'] ?? null;
            }

            // Prefer recipient from metadata but fall back to message fields
            $local_recipient = $recipient_number ?? ($m['recipient_id'] ?? $m['to'] ?? $m['wa_id'] ?? null);

            $result[] = [
                'id' => $m['id'] ?? null,
                'type' => $type,
                'from' => $from,
                'to' => $to,
                'recipient_number' => $local_recipient,
                'timestamp' => $timestamp,
                'text' => $text,
                'raw' => $m,
            ];
        }

        return $result;
    }

    /**
     * Safe getter for nested arrays
     */
    private function safeGet(array $array, array $path)
    {
        $current = $array;
        foreach ($path as $segment) {
            if (is_int($segment)) {
                if (!is_array($current) || !array_key_exists($segment, $current)) {
                    return null;
                }
                $current = $current[$segment];
            } else {
                if (!is_array($current) || !array_key_exists($segment, $current)) {
                    return null;
                }
                $current = $current[$segment];
            }
        }
        return $current;
    }
}
