<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WokwiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WokwiSyncController extends Controller
{
    protected $wokwiService;

    public function __construct(WokwiService $wokwiService)
    {
        $this->wokwiService = $wokwiService;
    }

    /**
     * POST /api/wokwi/sync
     * Endpoint para o Wokwi enviar dados de sensores
     */
    public function syncData(Request $request): JsonResponse
    {
        // Validar os dados recebidos do Wokwi
        $validated = $request->validate([
            'device_id' => 'required|string|max:100',
            'readings' => 'required|array',
            'readings.*.timestamp' => 'required|integer',
            'readings.*.voltage' => 'required|numeric|min:0',
            'readings.*.current' => 'required|numeric|min:0',
            'readings.*.power' => 'required|numeric|min:0',
            'readings.*.temperature' => 'nullable|numeric',
            'readings.*.humidity' => 'nullable|numeric',
        ]);

        // Salvar dados no Firebase RTDB usando o WokwiService
        $result = $this->wokwiService->saveSensorData($validated['device_id'], $data);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['error']
            ], 400);
        }

        // Processar dados para análise (opcional)
        $this->processSensorData($validated['device_id'], $data);

        return response()->json([
            'success' => true,
            'message' => 'Dados sincronizados com sucesso',
            'device_id' => $validated['device_id'],
            'readings_count' => count($data),
            'reading_id' => $result['reading_id'] ?? null
        ]);
    }

    /**
     * GET /api/wokwi/devices
     * Lista todos os dispositivos ativos
     */
    public function getActiveDevices(): JsonResponse
    {
        $activeDevices = $this->wokwiService->getActiveDevices();

        $formattedDevices = [];
        foreach ($activeDevices as $deviceId => $deviceData) {
            $formattedDevices[] = [
                'device_id' => $deviceId,
                'data' => $deviceData
            ];
        }

        return response()->json([
            'success' => true,
            'active_devices' => $formattedDevices,
            'total_active' => count($formattedDevices)
        ]);
    }

    /**
     * GET /api/wokwi/devices/{device}/status
     * Verifica status de um dispositivo específico
     */
    public function getDeviceStatus(string $device): JsonResponse
    {
        // Obter status do dispositivo
        $status = $this->wokwiService->getLatestReadings($device, 1);

        // Verificar se o dispositivo está ativo (última leitura < 5 minutos)
        $isActive = false;
        $lastReading = null;
        $readingCount = 0;

        if (!empty($status)) {
            $lastReading = $status[0];
            $readingCount = count($this->wokwiService->getLatestReadings($device, 100));
            $isActive = (time() - $lastReading['timestamp']) < 300; // 5 minutos
        }

        return response()->json([
            'success' => true,
            'device_id' => $device,
            'active' => $isActive,
            'last_reading' => $lastReading,
            'readings_count' => $readingCount,
            'last_reading_timestamp' => $lastReading['timestamp'] ?? null
        ]);
    }

    /**
     * Processa dados de sensores para análise
     */
    private function processSensorData(string $deviceId, array $readings): void
    {
        // Aqui você pode adicionar lógica para:
        // - Calcular médias
        // - Detectar anomalias
        // - Disparar alertas
        // - Atualizar estatísticas

        // Exemplo: Calcular consumo médio
        $totalPower = 0;
        $count = count($readings);

        foreach ($readings as $reading) {
            $totalPower += $reading['power'] ?? 0;
        }

        $averagePower = $count > 0 ? $totalPower / $count : 0;

        // Salvar estatísticas (opcional)
        // $this->saveStatistics($deviceId, [
        //     'average_power' => $averagePower,
        //     'total_readings' => $count,
        //     'processed_at' => time()
        // ]);
    }
}