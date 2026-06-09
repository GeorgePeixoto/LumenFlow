<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConsumptionHistoryService;
use App\Services\FirebaseRtdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SensorDataController extends Controller
{
    protected $firebaseRtdbService;
    protected $consumptionHistoryService;

    public function __construct(
        FirebaseRtdbService $firebaseRtdbService,
        ConsumptionHistoryService $consumptionHistoryService
    ) {
        $this->firebaseRtdbService = $firebaseRtdbService;
        $this->consumptionHistoryService = $consumptionHistoryService;
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
     * GET /api/dashboard/public
     * Obtém dados agregados para o dashboard (público).
     * Também grava histórico de consumo quando há mudanças nos dados.
     */
    public function getDashboard(): JsonResponse
    {
        $result = $this->firebaseRtdbService->getAllDevicesData();

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message'] ?? $result['error'] ?? 'Erro desconhecido'
            ], 404);
        }

        // Gravar histórico de consumo se houve mudanças (transação atômica)
        // Os dados brutos do Firebase estão disponíveis nos devices listados
        try {
            $rawSensorsData = $this->firebaseRtdbService->getRawSensorsData();
            if ($rawSensorsData) {
                $this->consumptionHistoryService->recordIfChanged($rawSensorsData);
                $this->updateConsumptionCards($rawSensorsData);
            }
        } catch (\Exception $e) {
            // Não falhar o endpoint por causa de erro no histórico
            \Illuminate\Support\Facades\Log::warning('History or card recording failed: ' . $e->getMessage());
        }

        $result['data']['consumption_cards'] = $this->getConsumptionCards();

        return response()->json($result);
    }

    /**
     * GET /api/dashboard (protegido)
     * Obtém dados agregados para o dashboard com autenticação
     */
    public function getAuthenticatedDashboard(): JsonResponse
    {
        $result = $this->firebaseRtdbService->getAllDevicesData();

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['message'] ?? $result['error'] ?? 'Erro desconhecido'
            ], 404);
        }

        $result['data']['consumption_cards'] = $this->getConsumptionCards();

        // Adicionar informações do usuário autenticado
        $user = auth()->user();
        $result['user'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];

        return response()->json($result);
    }

    /**
     * Atualiza os cards de consumo persistidos no banco de dados.
     */
    private function updateConsumptionCards(array $sensorsData): void
    {
        $tariff = 0.85; // R$/kWh

        foreach ($sensorsData as $deviceId => $sensorData) {
            if (!$sensorData || !is_array($sensorData)) {
                continue;
            }

            $powerW = $sensorData['potencia'] ?? 0;
            $incrementKwh = (float)$powerW / 1000000;
            $incrementCost = $incrementKwh * $tariff;

            // Encontrar ou criar o card para o device/setor
            $card = \App\Models\ConsumptionCard::firstOrCreate(
                ['key' => $deviceId],
                ['accumulated_kwh' => 0, 'accumulated_cost' => 0]
            );

            $card->accumulated_kwh = (float)$card->accumulated_kwh + $incrementKwh;
            $card->accumulated_cost = (float)$card->accumulated_cost + $incrementCost;
            $card->save();
        }
    }

    /**
     * Obtém todos os cards de consumo persistidos.
     */
    private function getConsumptionCards(): array
    {
        return \App\Models\ConsumptionCard::all()
            ->keyBy('key')
            ->map(function ($card) {
                return [
                    'kwh' => (float)$card->accumulated_kwh,
                    'cost' => (float)$card->accumulated_cost,
                ];
            })
            ->toArray();
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