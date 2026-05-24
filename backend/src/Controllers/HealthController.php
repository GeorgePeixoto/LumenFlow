<?php

namespace App\Controllers;

use App\Services\FirebaseService;

class HealthController
{
    /**
     * Endpoint /api/health
     * Valida o status da API e a possibilidade de instanciar a conexão com o Firebase.
     */
    public function check()
    {
        try {
            // Tenta obter a instância Singleton (valida se o Factory foi criado sem erros fatais)
            $firebase = FirebaseService::getInstance();
            
            // Se chegou aqui, a configuração básica da classe não quebrou
            http_response_code(200);
            echo json_encode([
                'status' => 'ok',
                'service' => 'EnergyFlow API',
                'firebase_factory' => 'initialized',
                'timestamp' => date('c')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Erro interno ao validar integridade',
                'details' => $e->getMessage()
            ]);
        }
    }
}
