<?php
// Generates a replacement pair (old -> new) for updating getFirstMessage()
// Run: php generate_whatsapp_getFirstMessage_patch.php
// Output: JSON with keys: file, old, new (use with your patch/apply workflow)

$file = __DIR__ . '/../app/Http/Controllers/API/WhatsAppWebhookLogAPIController.php';

$old = <<<'OLD'
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
        $to = $first['to'] ?? $first['recipient_id'] ?? $first['wa_id'] ?? $value['metadata']['phone_number_id'] ?? ($value['contacts'][0]['wa_id'] ?? null) ?? null;
        $timestamp = $first['timestamp'] ?? null;

        // Try many places for text/preview depending on message type
        $text = null;
        if ($type && isset($first[$type])) {
            // Common structures like 'text' => ['body' => '...']
            $possible = $first[$type];
            if (is_array($possible)) {
                $text = $possible['body'] ?? $possible['caption'] ?? null;
            }
        }
        $text = $text ?? ($first['text']['body'] ?? null);
        $text = $text ?? ($first['button']['text'] ?? $first['button']['payload'] ?? null);
        $text = $text ?? ($first['interactive']['button_reply']['id'] ?? $first['interactive']['button_reply']['title'] ?? null);

        return [
            'type' => $type,
            'from' => $from,
            'to' => $to,
            'timestamp' => $timestamp,
            'text' => $text,
            'raw' => $first,
        ];
    }
OLD;

$new = <<<'NEW'
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
NEW;

echo json_encode([
    'file' => $file,
    'old' => $old,
    'new' => $new,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
