<?php

namespace App\Services;

use App\Models\ConsumptionHistory;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\SectorConsumptionAverage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConsumptionHistoryService
{
    private const DEFAULT_TARIFF = 0.85; // R$/kWh

    /**
     * Verifica se houve mudanças nos dados do Firebase e grava histórico.
     * Usa transação atômica para garantir integridade.
     *
     * @param array $sensorsData Dados brutos do Firebase (/sensores)
     * @return array Resultado da operação
     */
    public function recordIfChanged(array $sensorsData): array
    {
        $recorded = 0;
        $skipped = 0;
        $recordedDeltas = [];

        try {
            DB::beginTransaction();

            foreach ($sensorsData as $deviceId => $sensorData) {
                if (!$sensorData || !is_array($sensorData)) {
                    $skipped++;
                    continue;
                }

                $sectorName = $deviceId; // ex: "Setor_A"
                $sectorLabel = $sensorData['nome'] ?? $deviceId;
                $powerW = $sensorData['potencia'] ?? 0;
                $currentKwh = ($sensorData['energia_kwh'] ?? 0) * 0.001;
                $timestamp = $sensorData['timestamp'] ?? time();

                // Calcular o consumo acumulado anterior (soma de todos os deltas registrados)
                $previousKwh = (float) ConsumptionHistory::where('sector_name', $sectorName)->sum('energy_kwh');

                $deltaKwh = $currentKwh - $previousKwh;
                if ($deltaKwh < 0) {
                    $deltaKwh = $currentKwh;
                }

                // Verificar se já temos um registro recente com os mesmos dados
                $lastRecord = ConsumptionHistory::where('sector_name', $sectorName)
                    ->orderByDesc('recorded_at')
                    ->first();

                // Detectar mudança: se a potência mudou significativamente, ou se houve algum consumo novo
                $hasChanged = !$lastRecord
                    || abs((float) $lastRecord->power_w - $powerW) > 0.01
                    || $deltaKwh > 0.0001;

                if (!$hasChanged) {
                    $skipped++;
                    $recordedDeltas[$sectorName] = 0.0;
                    continue;
                }

                // Calcular custo estimado baseado no delta
                $costEstimate = round($deltaKwh * self::DEFAULT_TARIFF, 2);

                ConsumptionHistory::create([
                    'sector_name' => $sectorName,
                    'sector_label' => $sectorLabel,
                    'firebase_device_id' => $deviceId,
                    'power_w' => $powerW,
                    'energy_kwh' => $deltaKwh,
                    'cost_estimate' => $costEstimate,
                    'tariff_used' => self::DEFAULT_TARIFF,
                    'recorded_at' => date('Y-m-d H:i:s', $timestamp),
                ]);

                // Sincronizar na tabela de leitura em tempo real (consumption_readings) se o device correspondente for encontrado
                $device = Device::where('firebase_id', $sectorName)->first();
                if ($device) {
                    ConsumptionReading::create([
                        'device_id' => $device->id,
                        'sector_id' => $device->sector_id,
                        'power_w' => $powerW,
                        'energy_kwh' => $deltaKwh,
                        'corrente' => $sensorData['corrente'] ?? null,
                        'tensao' => $sensorData['tensao'] ?? null,
                        'fator_pf' => $sensorData['fator_pf'] ?? null,
                        'read_at' => date('Y-m-d H:i:s', $timestamp),
                    ]);
                }

                $recordedDeltas[$sectorName] = $deltaKwh;
                $recorded++;
            }

            // Atualizar médias automáticas dos setores (apenas quando há novos dados)
            if ($recorded > 0) {
                $this->updateSectorAverages($sensorsData);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ConsumptionHistoryService::recordIfChanged error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }

        // Rodar detecção de alertas passando os deltas recém-registrados
        $this->runAlertDetection($sensorsData, $recordedDeltas);

        return [
            'success' => true,
            'recorded' => $recorded,
            'skipped' => $skipped,
        ];
    }

    /**
     * Atualiza médias automáticas de consumo para cada setor.
     * Calcula a média das últimas leituras (últimos 7 dias).
     */
    private function updateSectorAverages(array $sensorsData): void
    {
        $sevenDaysAgo = now()->subDays(7);

        foreach (array_keys($sensorsData) as $sectorName) {

            $avgKwh = ConsumptionHistory::where('sector_name', $sectorName)
                ->where('recorded_at', '>=', $sevenDaysAgo)
                ->where('energy_kwh', '<', 1.0) // excluir picos de baseline iniciais
                ->avg('energy_kwh');

            if ($avgKwh === null) {
                continue;
            }

            // Atualizar ou criar registro de média automática global
            SectorConsumptionAverage::updateOrCreate(
                [
                    'sector_name' => $sectorName,
                    'user_id' => null, // Média global (sem user específico)
                ],
                [
                    'average_kwh' => round($avgKwh, 4),
                    'is_manual_override' => false,
                    'calculated_at' => now(),
                ]
            );
        }
    }

    /**
     * Executa detecção de alertas globalmente.
     */
    private function runAlertDetection(array $sensorsData, array $recordedDeltas): void
    {
        try {
            $alertService = app(AlertDetectionService::class);

            // Executar detecção global (uma única vez)
            $user = User::first();
            if ($user) {
                $alertService->detectAll($user);
            }

            // Também rodar detecção de above_average (baseada em consumption_history)
            $alertService->detectAboveAverageFromHistory($sensorsData, $recordedDeltas);

            // Detectar consumo fora do horário comercial baseado nos dados do Firebase
            $alertService->detectOffHoursFromHistory($sensorsData);
        } catch (\Exception $e) {
            Log::warning('Alert detection after history recording failed: ' . $e->getMessage());
        }
    }
}

