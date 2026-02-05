<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Models\WhatsAppWebhookLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookLogAPIController extends AppBaseController
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role_or_permission:Super Admin|view_whatsapp_webhooks', ['only' => ['index', 'show']]);
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
     * Extract the first message summary from payload
     */
    private function getFirstMessage(array $payload): array
    {
        // Navigate common webhook structure: entry -> changes -> value -> messages
        $value = $this->safeGet($payload, ['entry', 0, 'changes', 0, 'value']);
        $messages = (array) ($this->safeGet($value, ['messages']) ?? []);
        $first = $messages[0] ?? null;

        if (!$first) {
            // Try top-level messages
            $first = $payload['messages'][0] ?? null;
        }

        if (!$first) return [];

        $type = $first['type'] ?? null;
        $from = $first['from'] ?? $first['author'] ?? null;
        $timestamp = $first['timestamp'] ?? null;
        $text = $first[$type]['body'] ?? $first['text']['body'] ?? null;

        return [
            'type' => $type,
            'from' => $from,
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

        $result = [];
        foreach ($messages as $m) {
            $type = $m['type'] ?? null;
            $from = $m['from'] ?? $m['recipient_id'] ?? $m['wa_id'] ?? null;
            $timestamp = $m['timestamp'] ?? null;
            $text = null;

            if ($type && isset($m[$type])) {
                $text = $m[$type]['body'] ?? null;
            }
            if (!$text && isset($m['text']['body'])) {
                $text = $m['text']['body'];
            }

            $result[] = [
                'id' => $m['id'] ?? null,
                'type' => $type,
                'from' => $from,
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
