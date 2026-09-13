<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class LiteLLMService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $model;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.litellm.base_url', 'http://127.0.0.1:4000'), '/');
        $this->apiKey = (string) config('services.litellm.api_key', '');
        $this->model = (string) config('services.litellm.model', 'balanced');
        $this->timeout = (int) config('services.litellm.timeout', 180);
    }

    public function model(): string
    {
        return $this->model;
    }

    /**
     * Send a chat completion request and return the assistant text.
     */
    public function chat(string $system, string $user, ?string $model = null): string
    {
        if ($this->apiKey === '') {
            throw new RuntimeException('LiteLLM API key is not configured.');
        }

        $response = Http::withToken($this->apiKey)
            ->timeout($this->timeout)
            ->acceptJson()
            ->post("{$this->baseUrl}/v1/chat/completions", [
                'model' => $model ?: $this->model,
                'temperature' => 0,
                'messages' => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            Log::warning('LiteLLM request failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);
            throw new RuntimeException('LiteLLM request failed with status ' . $response->status());
        }

        return (string) data_get($response->json(), 'choices.0.message.content', '');
    }

    /**
     * Chat request that must return a JSON object/array. Tolerates code fences.
     */
    public function chatJson(string $system, string $user, ?string $model = null): array
    {
        $text = $this->chat($system, $user, $model);
        $decoded = $this->decodeJson($text);

        if ($decoded === null) {
            throw new RuntimeException('LiteLLM returned invalid JSON.');
        }

        return $decoded;
    }

    /**
     * Extract the first JSON object/array found in a text response.
     */
    public function decodeJson(string $text): ?array
    {
        $text = trim($text);

        // Strip markdown code fences if present.
        $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
        $text = preg_replace('/\s*```$/', '', trim($text));

        $direct = json_decode($text, true);
        if (is_array($direct)) {
            return $direct;
        }

        // Fallback: grab the outermost object/array.
        if (preg_match('/(\{.*\}|\[.*\])/s', $text, $m)) {
            $decoded = json_decode($m[1], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }
}
