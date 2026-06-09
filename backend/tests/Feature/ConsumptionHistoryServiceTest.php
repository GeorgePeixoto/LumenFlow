<?php

namespace Tests\Feature;

use App\Models\ConsumptionHistory;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use App\Services\ConsumptionHistoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsumptionHistoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Sector $sector;
    private Device $device;
    private ConsumptionHistoryService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->sector = Sector::create([
            'user_id' => $this->user->id,
            'name' => 'Livraria',
            'active' => true,
        ]);
        $this->device = Device::create([
            'sector_id' => $this->sector->id,
            'name' => 'Refrigeracao',
            'firebase_id' => 'Setor_A',
            'type' => 'refrigeracao',
            'power_watts' => 1000,
            'active' => true,
        ]);

        $this->service = app(ConsumptionHistoryService::class);
    }

    public function test_record_if_changed_calculates_incremental_delta(): void
    {
        // 1. Primeira leitura: acumulado 10.0 kWh (será escalado por 0.001 para 0.0100 kWh)
        $sensorsData1 = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'potencia' => 1000,
                'energia_kwh' => 10.0,
                'timestamp' => time(),
            ],
        ];

        $result1 = $this->service->recordIfChanged($sensorsData1);
        $this->assertTrue($result1['success']);
        $this->assertEquals(1, $result1['recorded']);

        // O delta deve ser 0.0100 kWh
        $this->assertDatabaseHas('consumption_history', [
            'sector_name' => 'Setor_A',
            'energy_kwh' => 0.0100,
        ]);

        $this->assertDatabaseHas('consumption_readings', [
            'device_id' => $this->device->id,
            'energy_kwh' => 0.0100,
        ]);

        // 2. Segunda leitura: acumulado 15.0 kWh (escalado para 0.0150 kWh)
        // O delta deve ser 0.0150 - 0.0100 = 0.0050 kWh
        $sensorsData2 = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'potencia' => 1000,
                'energia_kwh' => 15.0,
                'timestamp' => time(),
            ],
        ];

        $result2 = $this->service->recordIfChanged($sensorsData2);
        $this->assertTrue($result2['success']);
        $this->assertEquals(1, $result2['recorded']);

        $this->assertDatabaseHas('consumption_history', [
            'sector_name' => 'Setor_A',
            'energy_kwh' => 0.0050,
        ]);

        $this->assertDatabaseHas('consumption_readings', [
            'device_id' => $this->device->id,
            'energy_kwh' => 0.0050,
        ]);

        // 3. Verificar que a soma total no banco é de 0.0150 kWh
        $this->assertEquals(0.0150, ConsumptionHistory::where('sector_name', 'Setor_A')->sum('energy_kwh'));
        $this->assertEquals(0.0150, ConsumptionReading::where('device_id', $this->device->id)->sum('energy_kwh'));
    }

    public function test_record_if_changed_handles_simulator_reset(): void
    {
        // 1. Primeira leitura: acumulado 10.0 kWh (0.0100 kWh escalado)
        $sensorsData1 = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'potencia' => 1000,
                'energia_kwh' => 10.0,
                'timestamp' => time(),
            ],
        ];
        $this->service->recordIfChanged($sensorsData1);

        // 2. Simulador reinicia e o acumulado cai para 2.0 kWh (0.0020 kWh escalado)
        // O delta deve ser reiniciado para 0.0020 kWh (e não negativo)
        $sensorsData2 = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'potencia' => 1000,
                'energia_kwh' => 2.0,
                'timestamp' => time(),
            ],
        ];

        $result2 = $this->service->recordIfChanged($sensorsData2);
        $this->assertTrue($result2['success']);
        $this->assertEquals(1, $result2['recorded']);

        $this->assertDatabaseHas('consumption_history', [
            'sector_name' => 'Setor_A',
            'energy_kwh' => 0.0020,
        ]);

        // A soma deve ser 0.0100 (primeira) + 0.0020 (segunda) = 0.0120 kWh
        $this->assertEquals(0.0120, ConsumptionHistory::where('sector_name', 'Setor_A')->sum('energy_kwh'));
    }
}
