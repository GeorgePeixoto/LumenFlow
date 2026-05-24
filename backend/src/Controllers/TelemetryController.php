<?php

namespace App\Controllers;

use App\Services\FirebaseService;

class TelemetryController
{
    /**
     * Endpoint GET /api/telemetry
     * Apenas para validação End-to-End do F0-I3.
     * Na prática, o frontend lerá o RTDB diretamente ou via WebSocket,
     * mas este endpoint prova que o PHP enxerga o dado que o Wokwi acabou de enviar.
     */
    public function getLatest()
    {
        try {
            $firebase = FirebaseService::getInstance();
            $rtdb = $firebase->getRealtimeDatabase();

            // Busca os dados de telemetria direto do banco (sem filtro para a POC)
            $reference = $rtdb->getReference('telemetry');
            $snapshot = $reference->getSnapshot();

            $data = $snapshot->getValue();

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'source' => 'Realtime Database',
                'data' => $data ?? 'Nenhum dado recebido ainda do Wokwi.'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Falha ao ler telemetria',
                'details' => $e->getMessage()
            ]);
        }
    }
}
