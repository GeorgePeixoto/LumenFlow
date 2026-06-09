<?php

namespace App\Support;

class FirebaseHttpOptions
{
    public static function build(): array
    {
        $httpOptions = [
            'timeout' => config('firebase.database.http_client.timeout', 30),
            'connect_timeout' => config('firebase.database.http_client.connect_timeout', 10),
        ];

        $verifySetting = config('firebase.http.verify', true);
        $caBundle = config('firebase.http.ca_bundle');

        $verifyBool = filter_var($verifySetting, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($verifyBool === false) {
            $httpOptions['verify'] = false;
            return $httpOptions;
        }

        $resolvedCaBundle = self::resolveCaBundle($caBundle);
        if ($resolvedCaBundle !== null) {
            $httpOptions['verify'] = $resolvedCaBundle;
        }

        return $httpOptions;
    }

    private static function resolveCaBundle(mixed $caBundle): ?string
    {
        if (!is_string($caBundle)) {
            return null;
        }

        $caBundle = trim($caBundle, " \t\n\r\0\x0B\"'");

        if ($caBundle === '') {
            return null;
        }

        if (is_file($caBundle) && is_readable($caBundle)) {
            return $caBundle;
        }

        return null;
    }
}