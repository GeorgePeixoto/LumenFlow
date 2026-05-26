<?php

namespace Tests\Feature;

use App\Models\Sector;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_list_sectors(): void
    {
        $this->user->sectors()->create(['name' => 'Refrigeracao']);
        $this->user->sectors()->create(['name' => 'Iluminacao']);

        $response = $this->actingAs($this->user)->getJson('/api/sectors');

        $response->assertOk()
            ->assertJsonCount(2, 'sectors');
    }

    public function test_create_sector(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/sectors', [
            'name' => 'Novo Setor',
            'description' => 'Descrição do setor',
            'threshold_yellow' => 50,
            'threshold_red' => 80,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('sector.name', 'Novo Setor');

        $this->assertDatabaseHas('sectors', ['name' => 'Novo Setor']);
    }

    public function test_show_sector(): void
    {
        $sector = $this->user->sectors()->create(['name' => 'Refrigeracao']);

        $response = $this->actingAs($this->user)->getJson("/api/sectors/{$sector->id}");

        $response->assertOk()
            ->assertJsonPath('sector.name', 'Refrigeracao');
    }

    public function test_update_sector(): void
    {
        $sector = $this->user->sectors()->create(['name' => 'Antigo']);

        $response = $this->actingAs($this->user)->putJson("/api/sectors/{$sector->id}", [
            'name' => 'Atualizado',
        ]);

        $response->assertOk()
            ->assertJsonPath('sector.name', 'Atualizado');
    }

    public function test_delete_sector(): void
    {
        $sector = $this->user->sectors()->create(['name' => 'Para Deletar']);

        $response = $this->actingAs($this->user)->deleteJson("/api/sectors/{$sector->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('sectors', ['id' => $sector->id]);
    }

    public function test_cannot_access_other_users_sector(): void
    {
        $otherUser = User::factory()->create();
        $sector = $otherUser->sectors()->create(['name' => 'Privado']);

        $response = $this->actingAs($this->user)->getJson("/api/sectors/{$sector->id}");

        $response->assertStatus(403);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/sectors');

        $response->assertStatus(401);
    }
}
