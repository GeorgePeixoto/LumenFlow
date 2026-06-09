<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'João Silva',
            'email' => 'joao@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'company_name' => 'Empresa Teste',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'joao@test.com']);
    }

    public function test_register_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'invalid',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_login_returns_token(): void
    {
        $user = User::factory()->create([
            'name' => 'João Silva',
            'company_name' => 'Empresa Teste',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.name', 'João Silva')
            ->assertJsonPath('user.company_name', 'Empresa Teste')
            ->assertJsonStructure(['user' => ['id', 'uid', 'email', 'name', 'company_name'], 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create([
            'name' => 'João Silva',
            'company_name' => 'Empresa Teste',
        ]);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.name', 'João Silva')
            ->assertJsonPath('user.company_name', 'Empresa Teste');
    }

    public function test_me_fails_without_auth(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create(['email' => 'joao@test.com']);
        $token = 'fake-token-joao@test.com';

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
