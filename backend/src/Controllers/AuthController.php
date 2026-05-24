<?php

namespace App\Controllers;

use App\Services\AuthService;

class AuthController
{
    public function register()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode(['code' => 'BAD_REQUEST', 'message' => 'Payload JSON inválido']);
            return;
        }

        try {
            $authService = new AuthService();
            $result = $authService->registerCompany($input);

            http_response_code(201); // 201 Created
            echo json_encode($result);

        } catch (\Exception $e) {
            $msg = $e->getMessage();
            http_response_code(400);

            // Mapeia exceções internas para códigos de erro que o frontend entende
            if (strpos($msg, 'VALIDATION_ERROR:') === 0) {
                echo json_encode([
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Erro de validação',
                    'details' => ['errors' => ['cnpj' => substr($msg, 17)]]
                ]);
            } else if ($msg === 'COMPANY_CNPJ_TAKEN') {
                echo json_encode(['code' => 'COMPANY_CNPJ_TAKEN', 'message' => 'Este CNPJ já está cadastrado.']);
            } else if ($msg === 'USER_EMAIL_TAKEN') {
                echo json_encode(['code' => 'USER_EMAIL_TAKEN', 'message' => 'Este E-mail já está em uso.']);
            } else {
                http_response_code(500);
                echo json_encode(['code' => 'SERVER_ERROR', 'message' => 'Erro interno: ' . $msg]);
            }
        }
    }
}
