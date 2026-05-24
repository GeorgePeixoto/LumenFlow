<?php

namespace App\Middlewares;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    /**
     * Valida o JWT do header Authorization e injeta os dados do usuário no contexto (US02-B3)
     */
    public static function protect()
    {
        // Trata a falta de getAllHeaders em servidores embutidos
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['code' => 'UNAUTHORIZED', 'message' => 'Token não fornecido ou inválido']);
            exit();
        }

        $jwt = $matches[1];
        // Nota: Idealmente o secret viria do .env
        $secretKey = $_ENV['JWT_SECRET'] ?? 'fallback_secret_energyflow_super_safe';

        try {
            $decoded = \App\Utils\JwtHelper::decode($jwt, $secretKey);
            
            // Injeta as informações do usuário em uma variável global para uso posterior na requisição
            $GLOBALS['user'] = [
                'user_id' => $decoded->sub,
                'company_id' => $decoded->company_id,
                'role' => $decoded->role
            ];

        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['code' => 'UNAUTHORIZED', 'message' => 'Sessão expirada ou token inválido']);
            exit();
        }
    }
}
