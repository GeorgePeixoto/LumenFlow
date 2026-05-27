<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Database;
use Illuminate\Support\Facades\Log;

class FirebaseRtdbService
{
    private Database $database;
    private string $rtdbUrl;

    public function __construct()
    {
        $this->rtdbUrl = config('firebase.rtdb_url');

        $factory = (new Factory)
            ->withServiceAccount(config('firebase.credentials'))
            ->withDatabaseUri($this->rtdbUrl);

        $this->database = $factory->createDatabase();
    }

    /**
     * Salva dados no Firebase RTDB
     */
    public function setData(string $path, $data): array
    {
        try {
            $reference = $this->database->getReference($path);
            $reference->set($data);

            return [
                'success' => true,
                'message' => 'Dados salvos com sucesso',
                'path' => $path
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao salvar dados no Firebase: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtém dados do Firebase RTDB
     */
    public function getData(string $path): array
    {
        try {
            $reference = $this->database->getReference($path);
            $snapshot = $reference->getSnapshot();

            if ($snapshot->exists()) {
                return [
                    'success' => true,
                    'data' => $snapshot->getValue(),
                    'path' => $path
                ];
            }

            return [
                'success' => false,
                'message' => 'Nenhum dado encontrado no caminho: ' . $path
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao obter dados do Firebase: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtém dados de sensores de um dispositivo específico
     */
    public function getSensorData(string $deviceId, ?int $limit = null): array
    {
        try {
            $path = "sensors/{$deviceId}/readings";
            $reference = $this->database->getReference($path);
            $snapshot = $reference->getSnapshot();

            if ($snapshot->exists()) {
                $data = $snapshot->getValue();

                // Ordenar por timestamp (mais recente primeiro)
                if (is_array($data)) {
                    krsort($data);

                    // Limitar número de resultados
                    if ($limit && count($data) > $limit) {
                        $data = array_slice($data, 0, $limit, true);
                    }
                }

                return [
                    'success' => true,
                    'data' => $data,
                    'device_id' => $deviceId,
                    'count' => is_array($data) ? count($data) : 0
                ];
            }

            return [
                'success' => false,
                'message' => "Nenhum dado encontrado para o dispositivo {$deviceId}"
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao obter dados do sensor: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtém dados de todos os dispositivos
     */
    public function getAllDevicesData(): array
    {
        try {
            $reference = $this->database->getReference("sensors");
            $snapshot = $reference->getSnapshot();

            if ($snapshot->exists()) {
                $data = $snapshot->getValue();

                // Processar dados para o dashboard
                $processedData = $this->processDashboardData($data);

                return [
                    'success' => true,
                    'data' => $processedData,
                    'devices' => array_keys($data ?? [])
                ];
            }

            return [
                'success' => false,
                'message' => 'Nenhum dispositivo encontrado'
            ];
        } catch (\Exception $e) {
            Log::error('Erro ao obter dados de todos os dispositivos: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Processa dados para o dashboard
     */
    private function processDashboardData(array $sensorsData): array
    {
        $dashboard = [
            'total_devices' => 0,
            'active_devices' => 0,
            'total_readings' => 0,
            'latest_readings' => [],
            'devices_status' => []
        ];

        foreach ($sensorsData as $deviceId => $readings) {
            $dashboard['total_devices']++;

            if (is_array($readings) && isset($readings['readings'])) {
                $latestReading = null;
                $readingCount = 0;

                // Ordenar e pegar o mais recente
                krsort($readings['readings']);
                $firstKey = key($readings['readings']);
                if ($firstKey) {
                    $latestReading = $readings['readings'][$firstKey];
                    $latestReading['timestamp'] = $firstKey;
                    $readingCount = count($readings['readings']);
                }

                // Verificar se o dispositivo está ativo (última leitura < 5 minutos)
                $isActive = $latestReading && (time() - $latestReading['timestamp']) < 300;

                $dashboard['active_devices'] += $isActive ? 1 : 0;
                $dashboard['total_readings'] += $readingCount;

                if ($latestReading) {
                    $dashboard['latest_readings'][$deviceId] = $latestReading;
                }

                $dashboard['devices_status'][$deviceId] = [
                    'active' => $isActive,
                    'last_reading' => $latestReading['timestamp'] ?? null,
                    'readings_count' => $readingCount
                ];
            }
        }

        return $dashboard;
    }
}