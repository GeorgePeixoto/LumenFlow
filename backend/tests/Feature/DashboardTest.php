<?php

namespace Tests\Feature;

use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Sector $sector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create(['name' => 'Refrigeracao']);
        $this->user->tariffs()->create([
            'name' => 'Convencional',
            'type' => 'convencional',
            'value_kwh' => 0.657,
            'active' => true,
        ]);
    }

    public function test_kpis_returns_data(): void
    {
        $device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Camara', 'type' => 'refrigeracao']);

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $device->id,
            'power_w' => 5000,
            'energy_kwh' => 5.0,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/dashboard/kpis');

        $response->assertOk()
            ->assertJsonStructure([
                'today_kwh', 'month_kwh', 'current_power_w',
                'monthly_cost', 'open_alerts', 'tariff_value',
            ]);
    }

    public function test_consumption_chart(): void
    {
        $device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Camara', 'type' => 'refrigeracao']);

        for ($i = 0; $i < 5; $i++) {
            ConsumptionReading::create([
                'sector_id' => $this->sector->id,
                'device_id' => $device->id,
                'power_w' => rand(3000, 6000),
                'energy_kwh' => rand(3, 6),
                'read_at' => now()->subDays($i),
            ]);
        }

        $response = $this->actingAs($this->user)->getJson('/api/dashboard/consumption?granularity=day');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_top_sectors(): void
    {
        $device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Camara', 'type' => 'refrigeracao']);

        ConsumptionReading::create([
            'sector_id' => $this->sector->id,
            'device_id' => $device->id,
            'power_w' => 5000,
            'energy_kwh' => 10.0,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/dashboard/top-sectors');

        $response->assertOk()
            ->assertJsonStructure(['sectors']);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/dashboard/kpis');
        $response->assertStatus(401);
    }
}
