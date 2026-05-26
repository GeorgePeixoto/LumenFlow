<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\DeviceMaintenance;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceMaintenanceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Sector $sector;
    private Device $device;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create(['name' => 'Producao']);
        $this->device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Motor 01', 'type' => 'motor']);
    }

    public function test_list_maintenance_records(): void
    {
        DeviceMaintenance::create(['device_id' => $this->device->id, 'date' => '2026-05-01', 'type' => 'Preventiva', 'notes' => 'Troca de filtro']);
        DeviceMaintenance::create(['device_id' => $this->device->id, 'date' => '2026-05-15', 'type' => 'Corretiva', 'notes' => 'Reparo no motor']);

        $response = $this->actingAs($this->user)->getJson("/api/devices/{$this->device->id}/maintenance");

        $response->assertOk()
            ->assertJsonCount(2, 'records');
    }

    public function test_create_maintenance_record(): void
    {
        $response = $this->actingAs($this->user)->postJson("/api/devices/{$this->device->id}/maintenance", [
            'date' => '2026-05-20',
            'type' => 'Preventiva',
            'notes' => 'Lubrificação geral',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('record.type', 'Preventiva')
            ->assertJsonPath('record.notes', 'Lubrificação geral');

        $this->assertDatabaseHas('device_maintenances', [
            'device_id' => $this->device->id,
            'type' => 'Preventiva',
        ]);
    }

    public function test_create_maintenance_requires_date_and_type(): void
    {
        $response = $this->actingAs($this->user)->postJson("/api/devices/{$this->device->id}/maintenance", [
            'notes' => 'Sem data e tipo',
        ]);

        $response->assertStatus(422);
    }

    public function test_cannot_access_other_users_device_maintenance(): void
    {
        $otherUser = User::factory()->create();
        $otherSector = $otherUser->sectors()->create(['name' => 'Privado']);
        $otherDevice = Device::create(['sector_id' => $otherSector->id, 'name' => 'Privado', 'type' => 'other']);

        $response = $this->actingAs($this->user)->getJson("/api/devices/{$otherDevice->id}/maintenance");

        $response->assertStatus(403);
    }
}
