<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\BusinessHour;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Goal;
use App\Models\Sector;
use App\Models\Tariff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Usuário demo ────────────────────────────────────────
        $user = User::create([
            'name' => 'Admin LumenFlow',
            'email' => 'admin@lumenflow.com',
            'password' => Hash::make('password'),
            'company_name' => 'Varejo Inteligente Ltda',
            'cnpj' => '12.345.678/0001-90',
            'segment' => 'varejo',
        ]);

        // ─── Setores (alinhados com ESP32 Wokwi) ─────────────────
        $setores = [
            ['name' => 'Refrigeracao', 'description' => 'Câmaras frias e freezers', 'threshold_yellow' => 60, 'threshold_red' => 90],
            ['name' => 'Iluminacao', 'description' => 'Iluminação geral do galpão, escritório e estacionamento', 'threshold_yellow' => 30, 'threshold_red' => 50],
            ['name' => 'Equipamentos', 'description' => 'Empilhadeira, esteira e compressor', 'threshold_yellow' => 80, 'threshold_red' => 120],
            ['name' => 'Escritorio', 'description' => 'Ar-condicionado, servidor e estações de trabalho', 'threshold_yellow' => 40, 'threshold_red' => 65],
        ];

        $sectors = [];
        foreach ($setores as $s) {
            $sectors[] = $user->sectors()->create($s);
        }

        // ─── Dispositivos (alinhados com ESP32 Wokwi) ────────────
        $devices = [
            // Refrigeracao (sector 0)
            ['sector' => 0, 'name' => 'Camara Fria 01', 'type' => 'refrigeracao', 'power_watts' => 3960],
            ['sector' => 0, 'name' => 'Camara Fria 02', 'type' => 'refrigeracao', 'power_watts' => 3520],
            ['sector' => 0, 'name' => 'Freezer Expositor', 'type' => 'refrigeracao', 'power_watts' => 1980],
            // Iluminacao (sector 1)
            ['sector' => 1, 'name' => 'Iluminacao Galpao', 'type' => 'iluminacao', 'power_watts' => 1320],
            ['sector' => 1, 'name' => 'Iluminacao Escritorio', 'type' => 'iluminacao', 'power_watts' => 660],
            ['sector' => 1, 'name' => 'Iluminacao Estacionamento', 'type' => 'iluminacao', 'power_watts' => 880],
            // Equipamentos (sector 2)
            ['sector' => 2, 'name' => 'Empilhadeira Eletrica', 'type' => 'motor', 'power_watts' => 5500],
            ['sector' => 2, 'name' => 'Esteira Transportadora', 'type' => 'motor', 'power_watts' => 3080],
            ['sector' => 2, 'name' => 'Compressor de Ar', 'type' => 'compressor', 'power_watts' => 4400],
            // Escritorio (sector 3)
            ['sector' => 3, 'name' => 'Central Ar-Condicionado', 'type' => 'ar_condicionado', 'power_watts' => 3300],
            ['sector' => 3, 'name' => 'Servidor TI', 'type' => 'equipamento', 'power_watts' => 1100],
            ['sector' => 3, 'name' => 'Estacoes de Trabalho', 'type' => 'equipamento', 'power_watts' => 880],
        ];

        $createdDevices = [];
        foreach ($devices as $d) {
            $createdDevices[] = Device::create([
                'sector_id' => $sectors[$d['sector']]->id,
                'name' => $d['name'],
                'type' => $d['type'],
                'power_watts' => $d['power_watts'],
            ]);
        }

        // ─── Leituras de consumo (últimos 7 dias) ───────────────
        foreach ($sectors as $sectorIndex => $sector) {
            $sectorDevices = array_filter($createdDevices, fn($d) => $d->sector_id === $sector->id);

            for ($day = 6; $day >= 0; $day--) {
                for ($hour = 7; $hour <= 22; $hour++) {
                    $readAt = now()->subDays($day)->setHour($hour)->setMinute(0)->setSecond(0);
                    $basePower = match ($sectorIndex) {
                        0 => rand(5000, 9000),   // Refrigeracao (alta carga)
                        1 => rand(1500, 4000),   // Iluminacao
                        2 => rand(6000, 12000),  // Equipamentos (maior carga)
                        3 => rand(2000, 5000),   // Escritorio
                    };

                    // Variação por hora (pico entre 10h-14h)
                    $multiplier = ($hour >= 10 && $hour <= 14) ? 1.3 : 1.0;
                    $power = $basePower * $multiplier + rand(-200, 200);

                    ConsumptionReading::create([
                        'sector_id' => $sector->id,
                        'device_id' => collect($sectorDevices)->random()->id,
                        'power_w' => round($power, 2),
                        'energy_kwh' => round($power / 1000, 4),
                        'corrente' => round($power / 220, 3),
                        'tensao' => round(220 + rand(-5, 5), 2),
                        'fator_pf' => round(0.85 + (rand(0, 10) / 100), 3),
                        'read_at' => $readAt,
                    ]);
                }
            }
        }

        // ─── Tarifas ─────────────────────────────────────────────
        Tariff::create([
            'user_id' => $user->id,
            'name' => 'Convencional B3',
            'type' => 'convencional',
            'value_kwh' => 0.6570,
            'active' => true,
        ]);

        Tariff::create([
            'user_id' => $user->id,
            'name' => 'Bandeira Verde',
            'type' => 'bandeira',
            'value_kwh' => 0.0000,
            'flag_color' => 'green',
            'active' => true,
        ]);

        Tariff::create([
            'user_id' => $user->id,
            'name' => 'Bandeira Vermelha P2',
            'type' => 'bandeira',
            'value_kwh' => 0.0782,
            'flag_color' => 'red_2',
            'active' => false,
        ]);

        // ─── Metas ───────────────────────────────────────────────
        Goal::create([
            'user_id' => $user->id,
            'scope' => 'global',
            'name' => 'Reduzir 15% no mês',
            'unit' => 'kwh',
            'value' => 5000,
            'current_value' => 3200,
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
            'status' => 'active',
        ]);

        Goal::create([
            'user_id' => $user->id,
            'scope' => 'sector',
            'sector_id' => $sectors[0]->id,
            'name' => 'Refrigeração abaixo de 3000 kWh',
            'unit' => 'kwh',
            'value' => 3000,
            'current_value' => 1800,
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
            'status' => 'active',
        ]);

        // ─── Alertas ─────────────────────────────────────────────
        Alert::create([
            'user_id' => $user->id,
            'sector_id' => $sectors[0]->id,
            'device_id' => $createdDevices[0]->id,
            'type' => 'overload',
            'severity' => 'high',
            'title' => 'Câmara Fria 01 acima do limite',
            'message' => 'O equipamento Câmara Fria 01 ultrapassou 90 kWh nas últimas 2 horas.',
            'status' => 'open',
        ]);

        Alert::create([
            'user_id' => $user->id,
            'sector_id' => $sectors[2]->id,
            'device_id' => $createdDevices[6]->id,
            'type' => 'night_waste',
            'severity' => 'medium',
            'title' => 'Empilhadeira consumindo fora do horário',
            'message' => 'Consumo detectado às 03:00 — verificar se equipamento foi desligado.',
            'status' => 'open',
        ]);

        Alert::create([
            'user_id' => $user->id,
            'sector_id' => $sectors[3]->id,
            'type' => 'off_hours',
            'severity' => 'low',
            'title' => 'Escritório ligado no domingo',
            'message' => 'Consumo detectado no escritório em dia não-útil.',
            'status' => 'acknowledged',
            'acknowledged_at' => now()->subHours(2),
        ]);

        // ─── Horário comercial ───────────────────────────────────
        $schedule = [
            ['day_of_week' => 0, 'enabled' => false, 'start_time' => '08:00', 'end_time' => '18:00'],
            ['day_of_week' => 1, 'enabled' => true, 'start_time' => '08:00', 'end_time' => '22:00'],
            ['day_of_week' => 2, 'enabled' => true, 'start_time' => '08:00', 'end_time' => '22:00'],
            ['day_of_week' => 3, 'enabled' => true, 'start_time' => '08:00', 'end_time' => '22:00'],
            ['day_of_week' => 4, 'enabled' => true, 'start_time' => '08:00', 'end_time' => '22:00'],
            ['day_of_week' => 5, 'enabled' => true, 'start_time' => '08:00', 'end_time' => '22:00'],
            ['day_of_week' => 6, 'enabled' => true, 'start_time' => '09:00', 'end_time' => '18:00'],
        ];

        foreach ($schedule as $s) {
            $user->businessHours()->create($s);
        }
    }
}
