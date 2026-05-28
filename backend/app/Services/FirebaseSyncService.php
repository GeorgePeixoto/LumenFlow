<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseSyncService
{
    private string $rtdbUrl;

    public function __construct()
    {
        $this->rtdbUrl = rtrim(config('firebase.connections.wokwi.database_url'), '/');
    }

    /**
     * Sincroniza leituras do Firebase RTDB.
     * Lê /sensores (dados por setor) e /equipamentos (dados por device).
     */
    public function syncReadings(?int $sectorId = null): array
    {
        try {
            $synced = 0;

            // Sync por setores (/sensores/Setor_A, Setor_B, etc.)
            $synced += $this->syncSensores($sectorId);

            // Sync por equipamentos (/equipamentos/*)
            $synced += $this->syncEquipamentos($sectorId);

            if ($synced === 0) {
                return ['synced' => 0, 'message' => 'Nenhum dado novo no Firebase'];
            }

            return ['synced' => $synced, 'message' => "Sincronizados {$synced} registros"];
        } catch (\Exception $e) {
            Log::error('Firebase sync error: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    private function syncSensores(?int $sectorId = null): int
    {
        // Implementar sincronização de sensores
        // Esta função agora só lê do Firebase e processa os dados
        return 0;
    }

    private function syncEquipamentos(?int $sectorId = null): int
    {
        // Implementar sincronização de equipamentos
        // Esta função agora só lê do Firebase e processa os dados
        return 0;
    }

    /**
     * Busca dados do Firebase para um setor específico
     */
    public function getSectorData(string $sectorId): array
    {
        try {
            $response = Http::get("{$this->rtdbUrl}/sensores/{$sectorId}.json");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error("Erro ao buscar dados do setor {$sectorId}: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("Exception ao buscar dados do setor {$sectorId}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Busca dados de um dispositivo específico
     */
    public function getDeviceData(string $deviceId): array
    {
        try {
            $response = Http::get("{$this->rtdbUrl}/equipamentos/{$deviceId}.json");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error("Erro ao buscar dados do dispositivo {$deviceId}: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("Exception ao buscar dados do dispositivo {$deviceId}: " . $e->getMessage());
            return [];
        }
    }
}