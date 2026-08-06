<?php

namespace App\Helper;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhatsappRateLimiter
{
    protected static int $cooldownMinutes = 15;

    public static function allow(string $phone): bool
    {
        $key = 'wa_rate_' . md5($phone);
        $lastSent = Cache::get($key);

        if ($lastSent && $lastSent->addMinutes(self::$cooldownMinutes)->isFuture()) {
            $retryAt = $lastSent->addMinutes(self::$cooldownMinutes);
            Log::warning('WhatsApp rate limited', [
                'phone' => $phone,
                'retry_after' => $retryAt->toDateTimeString(),
            ]);
            return false;
        }

        return true;
    }

    public static function markSent(string $phone): void
    {
        $key = 'wa_rate_' . md5($phone);
        Cache::put($key, now(), 600);
    }

    public static function forget(string $phone): void
    {
        $key = 'wa_rate_' . md5($phone);
        Cache::forget($key);
    }
}
