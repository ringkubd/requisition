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
            ->where(function ($q) {
                $q->where('payload', 'like', '%"contacts"%')
                  ->orWhere('method', 'OUTBOUND');
            })
            ->when($search, function ($q) use ($search) {
                $q->where('payload', 'like', '%' . $search . '%');
            })
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $contacts = [];
        foreach ($logs as $log) {
            $payload = $log->payload ?? [];

            if ($log->method === 'OUTBOUND') {
                $sentTo = $payload['sent_to'] ?? null;
                if (!$sentTo) continue;
                $key = $sentTo;
                if (!isset($contacts[$key]) || $log->created_at->gt($contacts[$key]['last_message_at'])) {
                    $contacts[$key] = [
                        'phone' => $sentTo,
                        'name' => $sentTo,
                        'last_message' => $payload['message'] ?? null,
                        'last_message_at' => $log->created_at->toDateTimeString(),
                        'last_message_type' => 'text',
                        'unread' => 0,
                    ];
                }
                continue;
            }

            $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
            if (!$value) continue;

            // Extract phone + name from contacts array
            $contactsArr = $value['contacts'] ?? [];
            $contactByWaId = [];
            foreach ($contactsArr as $c) {
                $waId = $c['wa_id'] ?? null;
                if ($waId) {
                    $contactByWaId[$waId] = $c['profile']['name'] ?? $c['name']['formatted_name'] ?? $waId;
                }
            }

            // Process messages (inbound)
            $msgs = $value['messages'] ?? [];
            foreach ($msgs as $msg) {
                $phone = $msg['from'] ?? null;
                if (!$phone) continue;

                $text = $this->extractMessageText($msg);
                $name = $contactByWaId[$phone] ?? $phone;

                $key = $phone;
                if (!isset($contacts[$key]) || $log->created_at->gt($contacts[$key]['last_message_at'])) {
                    $contacts[$key] = [
                        'phone' => $phone,
                        'name' => $name,
                        'last_message' => $text,
                        'last_message_at' => $log->created_at->toDateTimeString(),
                        'last_message_type' => $msg['type'] ?? null,
                        'unread' => 0,
                    ];
                }
            }

            // Process statuses — extract recipient phone
            $statuses = $value['statuses'] ?? [];
            foreach ($statuses as $st) {
                $phone = $st['recipient_id'] ?? null;
                if (!$phone) continue;

                $name = $contactByWaId[$phone] ?? $phone;

                $key = $phone;
                if (!isset($contacts[$key]) || $log->created_at->gt($contacts[$key]['last_message_at'])) {
                    $contacts[$key] = [
                        'phone' => $phone,
                        'name' => $name,
                        'last_message' => 'status: ' . ($st['status'] ?? 'delivered'),
                        'last_message_at' => $log->created_at->toDateTimeString(),
                        'last_message_type' => 'status',
                        'unread' => 0,
                    ];
                }
            }

            // If we have contacts but no messages/statuses, still add them
            if (empty($msgs) && empty($statuses)) {
                foreach ($contactByWaId as $waId => $name) {
                    $key = $waId;
                    if (!isset($contacts[$key])) {
                        $contacts[$key] = [
                            'phone' => $waId,
                            'name' => $name,
                            'last_message' => null,
                            'last_message_at' => $log->created_at->toDateTimeString(),
                            'last_message_type' => null,
                            'unread' => 0,
                        ];
                    }
                }
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
            $payload = $log->payload ?? [];

            // Handle outbound (sent) messages
            if ($log->method === 'OUTBOUND') {
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
                continue;
            }

            // Handle inbound webhook messages
            $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
            if (!$value) continue;

            // Get our business phone number to determine direction
            $ourPhoneId = $value['metadata']['phone_number_id'] ?? null;
            $ourDisplayPhone = $value['metadata']['display_phone_number'] ?? null;

            // Process messages
            $msgs = $value['messages'] ?? [];
            foreach ($msgs as $msg) {
                $msgPhone = $msg['from'] ?? null;
                if (!$msgPhone || !str_contains($msgPhone, $phone)) continue;

                $text = $this->extractMessageText($msg);

                // Direction: if the message is FROM the contact, it's inbound
                $allMessages[] = [
                    'id' => $msg['id'] ?? 'log_' . $log->id,
                    'from' => $msgPhone,
                    'to' => $ourDisplayPhone ?? $ourPhoneId ?? 'System',
                    'text' => $text,
                    'type' => $msg['type'] ?? null,
                    'timestamp' => $msg['timestamp'] ?? $log->created_at->timestamp,
                    'direction' => 'inbound',
                    'log_id' => $log->id,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            }

            // Process statuses (read receipts etc.) - extract the phone
            $statuses = $value['statuses'] ?? [];
            foreach ($statuses as $st) {
                $recipientId = $st['recipient_id'] ?? null;
                if (!$recipientId || !str_contains($recipientId, $phone)) continue;

                $allMessages[] = [
                    'id' => 'status_' . ($st['id'] ?? $log->id),
                    'from' => $recipientId,
                    'to' => $ourDisplayPhone ?? $ourPhoneId ?? 'System',
                    'text' => '✓ ' . ($st['status'] ?? 'delivered'),
                    'type' => 'status',
                    'timestamp' => $st['timestamp'] ?? $log->created_at->timestamp,
                    'direction' => 'inbound',
                    'log_id' => $log->id,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
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
     * Extract text from a message array regardless of type
     */
    private function extractMessageText(array $msg): ?string
    {
        $type = $msg['type'] ?? null;
        if ($type && isset($msg[$type])) {
            $candidate = $msg[$type];
            if (is_array($candidate)) {
                return $candidate['body'] ?? $candidate['caption'] ?? $candidate['text'] ?? $candidate['payload'] ?? $candidate['title'] ?? null;
            } elseif (is_string($candidate)) {
                return $candidate;
            }
        }
        return $msg['text']['body'] ?? $msg['button']['text'] ?? $msg['button']['payload'] ?? null;
    }

    /**
     * Extract the first message summary from payload
     */
    private function getFirstMessage(array $payload): array
    {
        $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
        if (!$value) return [];

        $metadata = $value['metadata'] ?? [];

        // Try messages first
        $msgs = $value['messages'] ?? [];
        if (!empty($msgs)) {
            $first = $msgs[0];
            $type = $first['type'] ?? null;
            $from = $first['from'] ?? null;
            $text = $this->extractMessageText($first);
            return [
                'type' => $type,
                'from' => $from,
                'to' => $metadata['display_phone_number'] ?? null,
                'recipient_id' => $metadata['phone_number_id'] ?? null,
                'timestamp' => $first['timestamp'] ?? null,
                'text' => $text,
                'raw' => $first,
            ];
        }

        // Fall back to statuses
        $statuses = $value['statuses'] ?? [];
        if (!empty($statuses)) {
            $st = $statuses[0];
            return [
                'type' => 'status',
                'from' => $st['recipient_id'] ?? null,
                'to' => $metadata['display_phone_number'] ?? null,
                'recipient_id' => $st['recipient_id'] ?? null,
                'timestamp' => $st['timestamp'] ?? null,
                'text' => 'status: ' . ($st['status'] ?? 'unknown'),
                'raw' => $st,
            ];
        }

        return [];
    }

    /**
     * Extract messages list from payload with normalized fields
     */
    private function extractMessages(array $payload): array
    {
        $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
        if (!$value) return [];

        $messages = $value['messages'] ?? [];
        $statuses = $value['statuses'] ?? [];
        $metadata = $value['metadata'] ?? [];
        $contactsList = $value['contacts'] ?? [];

        // Build a phone-to-name map from contacts
        $nameMap = [];
        foreach ($contactsList as $c) {
            $waId = $c['wa_id'] ?? null;
            if ($waId) {
                $nameMap[$waId] = $c['profile']['name'] ?? $c['name']['formatted_name'] ?? null;
            }
        }

        $recipient_number = $metadata['display_phone_number'] ?? $metadata['phone_number'] ?? $metadata['phone_number_id'] ?? null;

        $result = [];
        foreach ($messages as $m) {
            $result[] = [
                'id' => $m['id'] ?? null,
                'type' => $m['type'] ?? null,
                'from' => $m['from'] ?? null,
                'to' => $recipient_number,
                'recipient_number' => $recipient_number,
                'from_name' => $nameMap[$m['from'] ?? ''] ?? null,
                'timestamp' => $m['timestamp'] ?? null,
                'text' => $this->extractMessageText($m),
                'raw' => $m,
            ];
        }

        foreach ($statuses as $st) {
            $result[] = [
                'id' => $st['id'] ?? null,
                'type' => 'status',
                'from' => $st['recipient_id'] ?? null,
                'to' => $recipient_number,
                'recipient_number' => $recipient_number,
                'from_name' => $nameMap[$st['recipient_id'] ?? ''] ?? null,
                'timestamp' => $st['timestamp'] ?? null,
                'text' => '✓ ' . ($st['status'] ?? 'delivered'),
                'raw' => $st,
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
