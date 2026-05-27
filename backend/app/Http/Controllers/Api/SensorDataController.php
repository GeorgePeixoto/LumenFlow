<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FirebaseRtdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SensorDataController extends Controller
{
    protected $firebaseRtdbService;

    public function __construct(FirebaseRtdbService $firebaseRtdbService)
    {
        $this->firebaseRtdbService = $firebaseRtdbService;
    }

    /**
     * GET /api/sensors/{device}/readings
     * Obtém dados de um dispositivo específico
     */
    public function getDeviceReadings(string $device, Request $request): JsonResponse
    {
        $limit = $request->query('limit', 50); // Limitar a 50 leituras por padrão

        $result = $this->firebaseRtdbService->getSensorData($device, (int)$limit);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message']
            ], 404);
        }

        return response()->json($result);
    }

    /**
     * GET /api/dashboard
     * Obtém dados agregados para o dashboard
     */
    public function getDashboard(): JsonResponse
    {
        $result = $this->firebaseRtdbService->getAllDevicesData();

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message']
            ], 404);
        }

        return response()->json($result);
    }

    /**
     * GET /api/sensors/devices
     * Lista todos os dispositivos disponíveis
     */
    public function getDevices(): JsonResponse
    {
        $result = $this->firebaseRtdbService->getAllDevicesData();

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'devices' => $result['devices']
        ]);
    }

    /**
     * GET /api/sensors/{device}/latest
     * Obtém apenas a leitura mais recente de um dispositivo
     */
    public function getLatestReading(string $device): JsonResponse
    {
        $result = $this->firebaseRtdbService->getSensorData($device, 1);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message']
            ], 404);
        }

        if (empty($result['data'])) {
            return response()->json([
                'success' => false,
                'error' => 'Nenhuma leitura encontrada para este dispositivo'
            ], 404);
        }

        $latestReading = array_values($result['data'])[0];

        return response()->json([
            'success' => true,
            'device_id' => $device,
            'reading' => $latestReading
        ]);
    }
}