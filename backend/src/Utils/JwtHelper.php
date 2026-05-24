<?php

namespace App\Utils;

class JwtHelper
{
    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    public static function encode(array $payload, string $secret): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode(string $jwt, string $secret): object
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new \Exception('Formato de token inválido');
        }

        list($header64, $payload64, $signature64) = $parts;

        $validSignature = hash_hmac('sha256', $header64 . "." . $payload64, $secret, true);
        if (self::base64UrlEncode($validSignature) !== $signature64) {
            throw new \Exception('Assinatura inválida');
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload64)));
        
        if (isset($payload->exp) && $payload->exp < time()) {
            throw new \Exception('Token expirado');
        }

        return $payload;
    }
}
