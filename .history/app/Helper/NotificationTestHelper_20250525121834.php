<?php

namespace App\Helper;

use App\Models\User;

class NotificationTestHelper
{
    /**
     * Check if notification test mode is enabled
     *
     * @return bool
     */
    public static function isTestModeEnabled(): bool
    {
        return config('app.notification_test_mode', false);
    }

    /**
     * Get test user
     *
     * @return User
     */
    public static function getTestUser(): User
    {
        $testEmail = config('app.test_email', 'ajr.jahid@gmail.com');
        $user = User::firstWhere('email', $testEmail);

        if (!$user) {
            // Fallback to first user if test email user doesn't exist
            $user = User::first();
        }

        return $user;
    }

    /**
     * Get test phone number
     *
     * @return string
     */
    public static function getTestPhone(): string
    {
        return config('app.test_phone', '+8801737956549');
    }

    /**
     * Get users to notify in test mode
     *
     * @return array
     */
    public static function getTestModeUsers(): array
    {
        return [self::getTestUser()];
    }
}
