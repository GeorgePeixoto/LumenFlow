<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Device;
use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertBulkTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Sector $sector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->sector = $this->user->sectors()->create(['name' => 'Producao']);
    }

    public function test_bulk_acknowledge_alerts(): void
    {
        $a1 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'overload', 'severity' => 'high', 'status' => 'open', 'message' => 'Alert 1']);
        $a2 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'overload', 'severity' => 'medium', 'status' => 'open', 'message' => 'Alert 2']);
        $a3 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'anomaly', 'severity' => 'low', 'status' => 'acknowledged', 'message' => 'Alert 3']);

        $response = $this->actingAs($this->user)->patchJson('/api/alerts/bulk/acknowledge', [
            'ids' => [$a1->id, $a2->id, $a3->id],
        ]);

        $response->assertOk()->assertJsonPath('updated', 2);
        $this->assertDatabaseHas('alerts', ['id' => $a1->id, 'status' => 'acknowledged']);
        $this->assertDatabaseHas('alerts', ['id' => $a2->id, 'status' => 'acknowledged']);
        $this->assertDatabaseHas('alerts', ['id' => $a3->id, 'status' => 'acknowledged']);
    }

    public function test_bulk_resolve_alerts(): void
    {
        $a1 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'off_hours', 'severity' => 'medium', 'status' => 'open', 'message' => 'Alert 1']);
        $a2 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'off_hours', 'severity' => 'medium', 'status' => 'acknowledged', 'message' => 'Alert 2']);
        $a3 = Alert::create(['user_id' => $this->user->id, 'sector_id' => $this->sector->id, 'type' => 'off_hours', 'severity' => 'low', 'status' => 'resolved', 'message' => 'Alert 3']);

        $response = $this->actingAs($this->user)->patchJson('/api/alerts/bulk/resolve', [
            'ids' => [$a1->id, $a2->id, $a3->id],
        ]);

        $response->assertOk()->assertJsonPath('updated', 2);
        $this->assertDatabaseHas('alerts', ['id' => $a1->id, 'status' => 'resolved']);
        $this->assertDatabaseHas('alerts', ['id' => $a2->id, 'status' => 'resolved']);
        $this->assertDatabaseHas('alerts', ['id' => $a3->id, 'status' => 'resolved']);
    }

    public function test_bulk_acknowledge_requires_ids(): void
    {
        $response = $this->actingAs($this->user)->patchJson('/api/alerts/bulk/acknowledge', []);

        $response->assertStatus(422);
    }

    public function test_cannot_bulk_acknowledge_other_users_alerts(): void
    {
        $otherUser = User::factory()->create();
        $otherSector = $otherUser->sectors()->create(['name' => 'Outro']);
        $alert = Alert::create(['user_id' => $otherUser->id, 'sector_id' => $otherSector->id, 'type' => 'overload', 'severity' => 'high', 'status' => 'open', 'message' => 'Not mine']);

        $response = $this->actingAs($this->user)->patchJson('/api/alerts/bulk/acknowledge', [
            'ids' => [$alert->id],
        ]);

        $response->assertOk()->assertJsonPath('updated', 0);
        $this->assertDatabaseHas('alerts', ['id' => $alert->id, 'status' => 'open']);
    }
}
