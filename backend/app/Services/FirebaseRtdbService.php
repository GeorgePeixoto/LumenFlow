<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class FirebaseRtdbService
{
    private string $rtdbUrl;
    private string $apiKey;
    private Client $client;

    public function __construct()
    {
        $this->rtdbUrl = config('firebase.rtdb_url');
        $this->apiKey = config('firebase.auth.api_key');

        $this->client = new Client([
            'verify' => false, // Desativar verificação SSL para desenvolvimento
            'timeout' => 30,
        ]);
    }

    /**
     * Obtém dados de todos os dispositivos
     */
    public function getAllDevicesData(): array
    {
        try {
            $url = $this->rtdbUrl . '/sensores.json';

            if ($this->apiKey) {
                $url .= '?auth=' . $this->apiKey;
            }

            $response = $this->client->get($url);
            $data = json_decode($response->getBody()->getContents(), true);

            if ($data) {
                // Processar dados para o dashboard
                $processedData = $this->processDashboardData($data);

                return [
                    'success' => true,
                    'data' => $processedData,
                    'devices' => array_keys($data)
                ];
            }

            return [
                'success' => false,
                'message' => 'Nenhum dispositivo encontrado'
            ];
        } catch (RequestException $e) {
            Log::error('Erro ao obter dados do Firebase: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtém dados de um dispositivo específico
     */
    public function getSensorData(string $deviceId, ?int $limit = null): array
    {
        try {
            $url = $this->rtdbUrl . "/sensores/{$deviceId}.json";

            if ($this->apiKey) {
                $url .= '?auth=' . $this->apiKey;
            }

            $response = $this->client->get($url);
            $data = json_decode($response->getBody()->getContents(), true);

            if ($data) {
                return [
                    'success' => true,
                    'data' => [$data],
                    'device_id' => $deviceId,
                    'count' => 1
                ];
            }

            return [
                'success' => false,
                'message' => "Nenhum dado encontrado para o dispositivo {$deviceId}"
            ];
        } catch (RequestException $e) {
            Log::error('Erro ao obter dados do sensor: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Salva dados no Firebase
     */
    public function setData(string $path, $data): array
    {
        try {
            $url = $this->rtdbUrl . "/{$path}.json";

            if ($this->apiKey) {
                $url .= '?auth=' . $this->apiKey;
            }

            $response = $this->client->put($url, json_encode($data));

            return [
                'success' => true,
                'message' => 'Dados salvos com sucesso',
                'path' => $path
            ];
        } catch (RequestException $e) {
            Log::error('Erro ao salvar dados no Firebase: ' . $e->getMessage());
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
            'devices_status' => [],
            'setor_data' => []
        ];

        foreach ($sensorsData as $deviceId => $sensorData) {
            $dashboard['total_devices']++;

            if ($sensorData) {
                $timestamp = $sensorData['timestamp'] ?? time();
                $isActive = (time() - $timestamp) < 300; // Ativo se última leitura < 5 minutos

                $dashboard['active_devices'] += $isActive ? 1 : 0;
                $dashboard['total_readings']++;

                $dashboard['latest_readings'][$deviceId] = [
                    'nome' => $sensorData['nome'] ?? $deviceId,
                    'potencia' => $sensorData['potencia'] ?? 0,
                    'energia_kwh' => $sensorData['energia_kwh'] ?? 0,
                    'timestamp' => $timestamp
                ];

                $dashboard['devices_status'][$deviceId] = [
                    'active' => $isActive,
                    'last_reading' => $timestamp,
                    'readings_count' => 1
                ];

                // Adicionar dados por setor
                if (isset($sensorData['nome'])) {
                    $setor = $sensorData['nome'];
                    if (!isset($dashboard['setor_data'][$setor])) {
                        $dashboard['setor_data'][$setor] = [
                            'total_potencia' => 0,
                            'total_energia_kwh' => 0,
                            'devices' => []
                        ];
                    }

                    $dashboard['setor_data'][$setor]['total_potencia'] += $sensorData['potencia'] ?? 0;
                    $dashboard['setor_data'][$setor]['total_energia_kwh'] += $sensorData['energia_kwh'] ?? 0;
                    $dashboard['setor_data'][$setor]['devices'][] = $deviceId;
                }
            }
        }

        return $dashboard;
    }
}