<?php

namespace Tests\Unit;

use App\Models\Alert;
use App\Models\BusinessHour;
use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use App\Services\AlertDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AlertDetectionServiceTest extends TestCase
{
    use RefreshDatabase;

    private AlertDetectionService $service;
    private User $user;
    private Sector $sector;
    private Device $device;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new AlertDetectionService();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create([
            'name' => 'Refrigeracao',
            'threshold_red' => 10.0,
            'threshold_yellow' => 7.0,
        ]);
        $this->device = Device::create([
            'sector_id' => $this->sector->id,
            'name' => 'Compressor 1',
            'type' => 'compressor',
        ]);
    }

    public function test_detect_overload_creates_alert(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 15000,
            'energy_kwh' => 15.0,
            'read_at' => now()->subMinutes(30),
        ]);

        $count = $this->service->detectOverload($this->user);

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user->id,
            'sector_id' => $this->sector->id,
            'type' => 'overload',
            'severity' => 'high',
            'status' => 'open',
        ]);
    }

    public function test_detect_overload_skips_below_threshold(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 2000,
            'energy_kwh' => 5.0,
            'read_at' => now()->subMinutes(30),
        ]);

        $count = $this->service->detectOverload($this->user);

        $this->assertEquals(0, $count);
        $this->assertDatabaseMissing('alerts', ['type' => 'overload']);
    }

    public function test_detect_overload_respects_cooldown(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 15000,
            'energy_kwh' => 15.0,
            'read_at' => now()->subMinutes(30),
        ]);

        // Criar alerta recente (dentro do cooldown de 2h)
        Alert::create([
            'user_id' => $this->user->id,
            'sector_id' => $this->sector->id,
            'type' => 'overload',
            'severity' => 'high',
            'title' => 'Sobrecarga',
            'message' => 'Teste',
            'status' => 'open',
            'created_at' => now()->subHour(),
        ]);

        $count = $this->service->detectOverload($this->user);

        $this->assertEquals(0, $count);
    }

    public function test_detect_off_hours_creates_alert(): void
    {
        // Configurar horário comercial: 08:00-18:00 para hoje
        $dayOfWeek = now()->dayOfWeek;
        BusinessHour::create([
            'user_id' => $this->user->id,
            'day_of_week' => $dayOfWeek,
            'enabled' => true,
            'start_time' => '08:00',
            'end_time' => '18:00',
        ]);

        // Simular hora fora do expediente (03:00)
        Carbon::setTestNow(now()->setTime(3, 0));

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 800,
            'energy_kwh' => 0.8,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectOffHours($this->user);

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user->id,
            'type' => 'off_hours',
            'severity' => 'medium',
        ]);

        Carbon::setTestNow();
    }

    public function test_detect_off_hours_skips_during_business_hours(): void
    {
        $dayOfWeek = now()->dayOfWeek;
        BusinessHour::create([
            'user_id' => $this->user->id,
            'day_of_week' => $dayOfWeek,
            'enabled' => true,
            'start_time' => '08:00',
            'end_time' => '18:00',
        ]);

        // Simular hora dentro do expediente (10:00)
        Carbon::setTestNow(now()->setTime(10, 0));

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 800,
            'energy_kwh' => 0.8,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectOffHours($this->user);

        $this->assertEquals(0, $count);

        Carbon::setTestNow();
    }

    public function test_detect_night_waste_creates_alert(): void
    {
        // Simular horário noturno (23:00)
        Carbon::setTestNow(now()->setTime(23, 0));

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 500,
            'energy_kwh' => 0.5,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectNightWaste($this->user);

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user->id,
            'type' => 'night_waste',
            'severity' => 'medium',
        ]);

        Carbon::setTestNow();
    }

    public function test_detect_night_waste_skips_daytime(): void
    {
        // Simular horário diurno (14:00)
        Carbon::setTestNow(now()->setTime(14, 0));

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 500,
            'energy_kwh' => 0.5,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectNightWaste($this->user);

        $this->assertEquals(0, $count);

        Carbon::setTestNow();
    }

    public function test_detect_anomaly_creates_alert(): void
    {
        // Criar histórico de 7 dias com média de 200W
        for ($i = 1; $i <= 7; $i++) {
            ConsumptionReading::create([
                'sector_id' => $this->sector->id,
                'device_id' => $this->device->id,
                'power_w' => 200,
                'energy_kwh' => 1.0,
                'read_at' => now()->subDays($i),
            ]);
        }

        // Leitura atual com 500W (>2x a média de 200W)
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 500,
            'energy_kwh' => 0.5,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectAnomaly($this->user);

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user->id,
            'device_id' => $this->device->id,
            'type' => 'anomaly',
            'severity' => 'high',
        ]);
    }

    public function test_detect_anomaly_skips_normal_consumption(): void
    {
        // Histórico de 200W
        for ($i = 1; $i <= 7; $i++) {
            ConsumptionReading::create([
                'sector_id' => $this->sector->id,
                'device_id' => $this->device->id,
                'power_w' => 200,
                'energy_kwh' => 1.0,
                'read_at' => now()->subDays($i),
            ]);
        }

        // Leitura atual com 300W (1.5x, abaixo do threshold de 2x)
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 300,
            'energy_kwh' => 0.3,
            'read_at' => now()->subMinutes(5),
        ]);

        $count = $this->service->detectAnomaly($this->user);

        $this->assertEquals(0, $count);
    }

    public function test_detect_all_runs_all_detections(): void
    {
        $results = $this->service->detectAll($this->user);

        $this->assertArrayHasKey('overload', $results);
        $this->assertArrayHasKey('off_hours', $results);
        $this->assertArrayHasKey('night_waste', $results);
        $this->assertArrayHasKey('anomaly', $results);
    }

    public function test_multi_tenant_isolation(): void
    {
        $otherUser = User::factory()->create();
        $otherSector = $otherUser->sectors()->create([
            'name' => 'Outro Setor',
            'threshold_red' => 5.0,
        ]);
        $otherDevice = Device::create([
            'sector_id' => $otherSector->id,
            'name' => 'Device Outro',
            'type' => 'other',
        ]);

        // Consumo alto no setor do outro usuário
        ConsumptionReading::create([
            'sector_id' => $otherSector->id,
            'device_id' => $otherDevice->id,
            'power_w' => 20000,
            'energy_kwh' => 50.0,
            'read_at' => now()->subMinutes(30),
        ]);

        // Detectar para o nosso usuário — não deve gerar alertas
        $count = $this->service->detectOverload($this->user);

        $this->assertEquals(0, $count);
    }
}
