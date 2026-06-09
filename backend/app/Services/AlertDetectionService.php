<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\BusinessHour;
use App\Models\ConsumptionHistory;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\SectorConsumptionAverage;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AlertDetectionService
{
    /**
     * Executa todas as detecções de alerta globais.
     * Para fins de compatibilidade com chamadas antigas que passam um User.
     */
    public function detectAll(User $user): array
    {
        $results = [
            'overload' => $this->detectOverload($user),
            'off_hours' => $this->detectOffHours($user),
            'night_waste' => $this->detectNightWaste($user),
            'anomaly' => $this->detectAnomaly($user),
        ];

        $total = array_sum($results);
        if ($total > 0) {
            Log::info("AlertDetection: {$total} alertas gerados globalmente na execução do detectAll");
        }

        return $results;
    }

    /**
     * Detecta sobrecarga: consumo do setor acima do threshold_red (global).
     */
    public function detectOverload(User $user): int
    {
        $count = 0;
        $sectors = Sector::whereNotNull('threshold_red')->get();

        foreach ($sectors as $sector) {
            // Consumo da última hora
            $lastHourKwh = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subHour())
                ->sum('energy_kwh');

            if ($lastHourKwh <= $sector->threshold_red) {
                continue;
            }

            // Evita alerta duplicado global nas últimas 2 horas
            $recentAlert = Alert::where('sector_id', $sector->id)
                ->where('type', 'overload')
                ->where('created_at', '>=', now()->subHours(2))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $sector->user_id,
                'sector_id' => $sector->id,
                'type' => 'overload',
                'severity' => 'high',
                'title' => "Sobrecarga no setor {$sector->name}",
                'message' => "Consumo de {$lastHourKwh} kWh na última hora ultrapassa o limite de {$sector->threshold_red} kWh.",
                'status' => 'open',
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Detecta consumo fora do horário comercial (global).
     */
    public function detectOffHours(User $user): int
    {
        $count = 0;
        $now = now('America/Sao_Paulo');
        $dayOfWeek = $now->dayOfWeek; // 0=domingo, 6=sábado

        $sectors = Sector::all();

        foreach ($sectors as $sector) {
            // Busca horário comercial do proprietário do setor
            $businessHour = BusinessHour::where('user_id', $sector->user_id)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            // Se não há horário definido ou dia está desabilitado, qualquer consumo é off-hours
            $isOffHours = false;
            if (!$businessHour || !$businessHour->enabled) {
                $isOffHours = true;
            } else {
                $start = Carbon::parse($businessHour->start_time);
                $end = Carbon::parse($businessHour->end_time);
                $currentTime = $now->format('H:i:s');

                if ($currentTime < $start->format('H:i:s') || $currentTime > $end->format('H:i:s')) {
                    $isOffHours = true;
                }
            }

            if (!$isOffHours) {
                continue;
            }

            $recentPower = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subMinutes(15))
                ->avg('power_w');

            // Threshold: consumo > 500W fora do horário é suspeito
            if (!$recentPower || $recentPower < 500) {
                continue;
            }

            // Evita duplicata global nas últimas 6 horas
            $recentAlert = Alert::where('sector_id', $sector->id)
                ->where('type', 'off_hours')
                ->where('created_at', '>=', now()->subHours(6))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $sector->user_id,
                'sector_id' => $sector->id,
                'type' => 'off_hours',
                'severity' => 'medium',
                'title' => "{$sector->name} consumindo fora do horário",
                'message' => "Consumo médio de " . round($recentPower) . "W detectado fora do horário comercial.",
                'status' => 'open',
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Detecta desperdício noturno (consumo entre 22h e 6h) (global).
     */
    public function detectNightWaste(User $user): int
    {
        $count = 0;
        $hour = now('America/Sao_Paulo')->hour;

        // Só detecta entre 22h e 6h
        if ($hour >= 6 && $hour < 22) {
            return 0;
        }

        $sectors = Sector::all();

        foreach ($sectors as $sector) {
            $recentPower = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subMinutes(15))
                ->avg('power_w');

            // Threshold: consumo > 300W à noite é suspeito
            if (!$recentPower || $recentPower < 300) {
                continue;
            }

            // Evita duplicata global nas últimas 8 horas
            $recentAlert = Alert::where('sector_id', $sector->id)
                ->where('type', 'night_waste')
                ->where('created_at', '>=', now()->subHours(8))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $sector->user_id,
                'sector_id' => $sector->id,
                'type' => 'night_waste',
                'severity' => 'medium',
                'title' => "Desperdício noturno em {$sector->name}",
                'message' => "Consumo médio de " . round($recentPower) . "W detectado no período noturno (22h-6h).",
                'status' => 'open',
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Detecta anomalia: consumo de um device muito acima da média histórica (global).
     */
    public function detectAnomaly(User $user): int
    {
        $count = 0;
        $devices = Device::all();

        foreach ($devices as $device) {
            // Média dos últimos 7 dias
            $avgPower = ConsumptionReading::where('device_id', $device->id)
                ->where('read_at', '>=', now()->subDays(7))
                ->where('read_at', '<', now()->subHour())
                ->avg('power_w');

            if (!$avgPower || $avgPower < 100) {
                continue;
            }

            // Consumo atual (última leitura)
            $currentPower = ConsumptionReading::where('device_id', $device->id)
                ->where('read_at', '>=', now()->subMinutes(15))
                ->avg('power_w');

            if (!$currentPower) {
                continue;
            }

            // Anomalia: consumo > 2x a média
            if ($currentPower <= $avgPower * 2) {
                continue;
            }

            // Evita duplicata global nas últimas 4 horas
            $recentAlert = Alert::where('device_id', $device->id)
                ->where('type', 'anomaly')
                ->where('created_at', '>=', now()->subHours(4))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $device->sector->user_id ?? (User::first()->id ?? 1),
                'sector_id' => $device->sector_id,
                'device_id' => $device->id,
                'type' => 'anomaly',
                'severity' => 'high',
                'title' => "Anomalia em {$device->name}",
                'message' => "Consumo atual (" . round($currentPower) . "W) é " . round($currentPower / $avgPower, 1) . "x acima da média (" . round($avgPower) . "W).",
                'status' => 'open',
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Detecta consumo acima da média baseado na tabela consumption_history (global).
     * Chamado após gravação de histórico (dados do Firebase).
     * Threshold: consumo atual >= 130% da média do setor.
     */
    public function detectAboveAverageFromHistory(array $sensorsData, array $recordedDeltas = []): int
    {
        $count = 0;
        $users = User::all();

        foreach ($sensorsData as $sectorName => $sensorData) {
            if (!$sensorData || !is_array($sensorData)) {
                continue;
            }

            // Usar o delta de consumo incremental obtido da gravação recente,
            // caindo de volta para o valor absoluto escalado para compatibilidade retroativa (testes)
            if (isset($recordedDeltas[$sectorName])) {
                $currentKwh = $recordedDeltas[$sectorName];
            } else {
                $currentKwh = ($sensorData['energia_kwh'] ?? 0) * 0.001;
            }

            if ($currentKwh <= 0 || $currentKwh > 1.0) {
                continue;
            }

            $sectorLabel = $sensorData['nome'] ?? $sectorName;

            foreach ($users as $user) {
                // Buscar média: priorizar override manual deste usuário, depois automática global
                $average = SectorConsumptionAverage::where('sector_name', $sectorName)
                    ->where('user_id', $user->id)
                    ->where('is_manual_override', true)
                    ->first();

                if (!$average) {
                    $average = SectorConsumptionAverage::where('sector_name', $sectorName)
                        ->where('is_manual_override', false)
                        ->first();
                }

                if (!$average || $average->average_kwh <= 0) {
                    continue;
                }

                $threshold = (float) $average->average_kwh * 1.3; // 130% da média

                if ($currentKwh < $threshold) {
                    continue;
                }

                // Evita duplicata por usuário no último 1 minuto
                $recentAlert = Alert::where('user_id', $user->id)
                    ->where('type', 'above_average')
                    ->where('title', 'LIKE', "%{$sectorLabel}%")
                    ->where('created_at', '>=', now()->subMinutes(1))
                    ->exists();

                if ($recentAlert) {
                    continue;
                }

                $percentAbove = round(($currentKwh / (float) $average->average_kwh - 1) * 100);

                Alert::create([
                    'user_id' => $user->id,
                    'type' => 'above_average',
                    'severity' => 'high',
                    'title' => "Consumo acima da média em {$sectorLabel}",
                    'message' => "O setor {$sectorLabel} está consumindo {$currentKwh} kWh, {$percentAbove}% acima da média configurada ({$average->average_kwh} kWh).",
                    'status' => 'open',
                ]);

                $count++;
            }
        }

        if ($count > 0) {
            Log::info("AlertDetection: {$count} alertas above_average gerados globalmente");
        }

        return $count;
    }

    /**
     * Detecta consumo fora do horário comercial baseado nos dados do Firebase (global).
     * Usa a tabela consumption_history + business_hours para verificar.
     */
    public function detectOffHoursFromHistory(array $sensorsData): int
    {
        $count = 0;
        $now = now('America/Sao_Paulo');
        $dayOfWeek = $now->dayOfWeek;

        // Compilar setores em violação baseados nas configurações de horário comercial de cada usuário
        $usersWithBH = User::has('businessHours')->get();

        foreach ($usersWithBH as $bhUser) {
            $businessHour = BusinessHour::where('user_id', $bhUser->id)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            $isOffHours = false;
            if (!$businessHour || !$businessHour->enabled) {
                $isOffHours = true;
            } else {
                $start = Carbon::parse($businessHour->start_time);
                $end = Carbon::parse($businessHour->end_time);
                $currentTime = $now->format('H:i:s');

                if ($currentTime < $start->format('H:i:s') || $currentTime > $end->format('H:i:s')) {
                    $isOffHours = true;
                }
            }

            if (!$isOffHours) {
                continue;
            }

            // Verificar cada setor do Firebase com consumo ativo para este usuário
            foreach ($sensorsData as $sectorName => $sensorData) {
                if (!$sensorData || !is_array($sensorData)) {
                    continue;
                }

                $powerW = $sensorData['potencia'] ?? 0;

                // Só gera alerta se potência > 100W (dispositivo ligado)
                if ($powerW < 100) {
                    continue;
                }

                $sectorLabel = $sensorData['nome'] ?? $sectorName;

                // Evita duplicata por usuário nas últimas 6 horas
                $recentAlert = Alert::where('user_id', $bhUser->id)
                    ->where('type', 'off_hours')
                    ->where('title', 'LIKE', "%{$sectorLabel}%")
                    ->where('created_at', '>=', now()->subHours(6))
                    ->exists();

                if ($recentAlert) {
                    continue;
                }

                Alert::create([
                    'user_id' => $bhUser->id,
                    'type' => 'off_hours',
                    'severity' => 'medium',
                    'title' => "{$sectorLabel} consumindo fora do horário",
                    'message' => "Consumo de " . round($powerW) . "W detectado fora do horário comercial no setor {$sectorLabel}.",
                    'status' => 'open',
                ]);

                $count++;
            }
        }

        return $count;
    }
}
