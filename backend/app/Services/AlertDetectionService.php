<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\BusinessHour;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AlertDetectionService
{
    /**
     * Executa todas as detecções de alerta para um usuário.
     * Chamado após cada sync do Firebase.
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
            Log::info("AlertDetection: {$total} alertas gerados para user {$user->id}", $results);
        }

        return $results;
    }

    /**
     * Detecta sobrecarga: consumo do setor acima do threshold_red.
     */
    public function detectOverload(User $user): int
    {
        $count = 0;
        $sectors = $user->sectors()->whereNotNull('threshold_red')->get();

        foreach ($sectors as $sector) {
            // Consumo da última hora
            $lastHourKwh = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subHour())
                ->sum('energy_kwh');

            if ($lastHourKwh <= $sector->threshold_red) {
                continue;
            }

            // Evita alerta duplicado nas últimas 2 horas
            $recentAlert = Alert::where('user_id', $user->id)
                ->where('sector_id', $sector->id)
                ->where('type', 'overload')
                ->where('created_at', '>=', now()->subHours(2))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $user->id,
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
     * Detecta consumo fora do horário comercial.
     */
    public function detectOffHours(User $user): int
    {
        $count = 0;
        $now = now();
        $dayOfWeek = $now->dayOfWeek; // 0=domingo, 6=sábado

        // Busca horário comercial do dia
        $businessHour = BusinessHour::where('user_id', $user->id)
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
            return 0;
        }

        // Verifica se há consumo significativo nos últimos 15 minutos
        $sectors = $user->sectors()->get();

        foreach ($sectors as $sector) {
            $recentPower = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subMinutes(15))
                ->avg('power_w');

            // Threshold: consumo > 500W fora do horário é suspeito
            if (!$recentPower || $recentPower < 500) {
                continue;
            }

            // Evita duplicata nas últimas 6 horas
            $recentAlert = Alert::where('user_id', $user->id)
                ->where('sector_id', $sector->id)
                ->where('type', 'off_hours')
                ->where('created_at', '>=', now()->subHours(6))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $user->id,
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
     * Detecta desperdício noturno (consumo entre 22h e 6h).
     */
    public function detectNightWaste(User $user): int
    {
        $count = 0;
        $hour = now()->hour;

        // Só detecta entre 22h e 6h
        if ($hour >= 6 && $hour < 22) {
            return 0;
        }

        $sectors = $user->sectors()->get();

        foreach ($sectors as $sector) {
            $recentPower = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', '>=', now()->subMinutes(15))
                ->avg('power_w');

            // Threshold: consumo > 300W à noite é suspeito
            if (!$recentPower || $recentPower < 300) {
                continue;
            }

            // Evita duplicata nas últimas 8 horas
            $recentAlert = Alert::where('user_id', $user->id)
                ->where('sector_id', $sector->id)
                ->where('type', 'night_waste')
                ->where('created_at', '>=', now()->subHours(8))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $user->id,
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
     * Detecta anomalia: consumo de um device muito acima da média histórica.
     */
    public function detectAnomaly(User $user): int
    {
        $count = 0;
        $sectorIds = $user->sectors()->pluck('id');

        $devices = Device::whereIn('sector_id', $sectorIds)->get();

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

            // Evita duplicata nas últimas 4 horas
            $recentAlert = Alert::where('user_id', $user->id)
                ->where('device_id', $device->id)
                ->where('type', 'anomaly')
                ->where('created_at', '>=', now()->subHours(4))
                ->exists();

            if ($recentAlert) {
                continue;
            }

            Alert::create([
                'user_id' => $user->id,
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
}
