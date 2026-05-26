<?php

namespace Tests\Unit;

use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use App\Services\ConsumptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsumptionServiceTest extends TestCase
{
    use RefreshDatabase;

    private ConsumptionService $service;
    private User $user;
    private Sector $sector;
    private Device $device;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ConsumptionService();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create(['name' => 'Refrigeracao']);
        $this->device = Device::create([
            'sector_id' => $this->sector->id,
            'name' => 'Compressor 1',
            'type' => 'compressor',
        ]);
        $this->user->tariffs()->create([
            'name' => 'Convencional',
            'type' => 'convencional',
            'value_kwh' => 0.50,
            'active' => true,
        ]);
    }

    public function test_get_kpis_with_readings(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 3000,
            'energy_kwh' => 3.0,
            'read_at' => now(),
        ]);

        $kpis = $this->service->getKpis($this->user);

        $this->assertEquals(3.0, $kpis['today_kwh']);
        $this->assertEquals(3.0, $kpis['month_kwh']);
        $this->assertEquals(3000, $kpis['current_power_w']);
        $this->assertEquals(1.50, $kpis['monthly_cost']);
        $this->assertEquals(0.50, $kpis['tariff_value']);
        $this->assertEquals(0, $kpis['open_alerts']);
        $this->assertEquals(1, $kpis['active_devices']);
    }

    public function test_get_kpis_empty_returns_zeros(): void
    {
        $kpis = $this->service->getKpis($this->user);

        $this->assertEquals(0, $kpis['today_kwh']);
        $this->assertEquals(0, $kpis['month_kwh']);
        $this->assertEquals(0, $kpis['current_power_w']);
        $this->assertEquals(0, $kpis['monthly_cost']);
    }

    public function test_get_consumption_chart_groups_by_day(): void
    {
        for ($i = 0; $i < 3; $i++) {
            ConsumptionReading::create([
                'sector_id' => $this->sector->id,
                'device_id' => $this->device->id,
                'power_w' => 2000,
                'energy_kwh' => 2.0,
                'read_at' => now()->subDays($i)->startOfDay()->addHours(10),
            ]);
        }

        $from = now()->subDays(6)->toDateString();
        $to = now()->toDateString();

        $data = $this->service->getConsumptionChart($this->user, $from, $to, 'day');

        $this->assertCount(3, $data);
        $this->assertArrayHasKey('period', $data[0]);
        $this->assertArrayHasKey('total_kwh', $data[0]);
        $this->assertArrayHasKey('avg_power_w', $data[0]);
    }

    public function test_get_top_sectors_ranking(): void
    {
        $sector2 = $this->user->sectors()->create(['name' => 'Iluminacao']);
        $device2 = Device::create([
            'sector_id' => $sector2->id,
            'name' => 'Luminaria',
            'type' => 'lighting',
        ]);

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 5000,
            'energy_kwh' => 10.0,
            'read_at' => now(),
        ]);

        ConsumptionReading::create([
            'sector_id' => $sector2->id,
            'device_id' => $device2->id,
            'power_w' => 2000,
            'energy_kwh' => 3.0,
            'read_at' => now(),
        ]);

        $from = now()->startOfMonth()->toDateString();
        $to = now()->toDateString();

        $result = $this->service->getTopSectors($this->user, $from, $to, 5);

        $this->assertCount(2, $result);
        $this->assertEquals('Refrigeracao', $result[0]['name']);
        $this->assertEquals('Iluminacao', $result[1]['name']);
    }

    public function test_get_monthly_projection(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 4000,
            'energy_kwh' => 100.0,
            'read_at' => now()->subDay(),
        ]);

        $projection = $this->service->getMonthlyProjection($this->user);

        $this->assertArrayHasKey('current_kwh', $projection);
        $this->assertArrayHasKey('daily_avg_kwh', $projection);
        $this->assertArrayHasKey('projected_kwh', $projection);
        $this->assertArrayHasKey('projected_cost', $projection);
        $this->assertArrayHasKey('days_elapsed', $projection);
        $this->assertArrayHasKey('days_in_month', $projection);
        $this->assertGreaterThanOrEqual(0, $projection['projected_kwh']);
    }

    public function test_get_accumulated_by_sector(): void
    {
        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $this->device->id,
            'power_w' => 3000,
            'energy_kwh' => 5.0,
            'read_at' => now(),
        ]);

        $from = now()->startOfMonth()->toDateString();
        $to = now()->toDateString();

        $result = $this->service->getAccumulatedBySector($this->user, $from, $to);

        $this->assertCount(1, $result);
        $this->assertEquals('Refrigeracao', $result[0]['name']);
        $this->assertEquals(5.0, (float) $result[0]['total_kwh']);
    }

    public function test_multi_tenant_isolation(): void
    {
        $otherUser = User::factory()->create();
        $otherSector = $otherUser->sectors()->create(['name' => 'Outro']);
        $otherDevice = Device::create([
            'sector_id' => $otherSector->id,
            'name' => 'Device Outro',
            'type' => 'other',
        ]);

        ConsumptionReading::create([
            'sector_id' => $otherSector->id,
            'device_id' => $otherDevice->id,
            'power_w' => 9000,
            'energy_kwh' => 50.0,
            'read_at' => now(),
        ]);

        $kpis = $this->service->getKpis($this->user);

        $this->assertEquals(0, $kpis['today_kwh']);
        $this->assertEquals(0, $kpis['month_kwh']);
    }
}
