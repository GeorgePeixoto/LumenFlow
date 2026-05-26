<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Sector $sector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create(['name' => 'Refrigeracao']);
    }

    public function test_list_devices(): void
    {
        Device::create(['sector_id' => $this->sector->id, 'name' => 'Camara Fria 01', 'type' => 'refrigeracao']);
        Device::create(['sector_id' => $this->sector->id, 'name' => 'Camara Fria 02', 'type' => 'refrigeracao']);

        $response = $this->actingAs($this->user)->getJson('/api/devices');

        $response->assertOk()
            ->assertJsonCount(2, 'devices');
    }

    public function test_create_device(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/devices', [
            'sector_id' => $this->sector->id,
            'name' => 'Freezer Expositor',
            'type' => 'refrigeracao',
            'power_watts' => 1980,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('device.name', 'Freezer Expositor');
    }

    public function test_cannot_create_device_in_other_users_sector(): void
    {
        $otherUser = User::factory()->create();
        $otherSector = $otherUser->sectors()->create(['name' => 'Privado']);

        $response = $this->actingAs($this->user)->postJson('/api/devices', [
            'sector_id' => $otherSector->id,
            'name' => 'Hack Device',
            'type' => 'other',
        ]);

        $response->assertStatus(403);
    }

    public function test_update_device(): void
    {
        $device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Antigo', 'type' => 'motor']);

        $response = $this->actingAs($this->user)->putJson("/api/devices/{$device->id}", [
            'name' => 'Atualizado',
            'status' => 'maintenance',
        ]);

        $response->assertOk()
            ->assertJsonPath('device.name', 'Atualizado')
            ->assertJsonPath('device.status', 'maintenance');
    }

    public function test_delete_device(): void
    {
        $device = Device::create(['sector_id' => $this->sector->id, 'name' => 'Para Deletar', 'type' => 'other']);

        $response = $this->actingAs($this->user)->deleteJson("/api/devices/{$device->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('devices', ['id' => $device->id]);
    }
}
