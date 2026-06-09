<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\BusinessHour;
use App\Models\SectorConsumptionAverage;
use App\Models\User;
use App\Services\AlertDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AlertScopingTest extends TestCase
{
    use RefreshDatabase;

    private User $user1;
    private User $user2;
    private AlertDetectionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user1 = User::factory()->create(['email' => 'user1@test.com']);
        $this->user2 = User::factory()->create(['email' => 'user2@test.com']);
        $this->service = new AlertDetectionService();
    }

    public function test_sector_averages_filtered_by_authenticated_user(): void
    {
        // 1. Médias globais automáticas (user_id = null)
        SectorConsumptionAverage::create([
            'sector_name' => 'Setor_A',
            'user_id' => null,
            'average_kwh' => 0.0200,
            'is_manual_override' => false,
        ]);

        // 2. Override manual do User 1
        SectorConsumptionAverage::create([
            'sector_name' => 'Setor_A',
            'user_id' => $this->user1->id,
            'average_kwh' => 0.0150,
            'is_manual_override' => true,
        ]);

        // 3. Override manual do User 2
        SectorConsumptionAverage::create([
            'sector_name' => 'Setor_A',
            'user_id' => $this->user2->id,
            'average_kwh' => 0.0500,
            'is_manual_override' => true,
        ]);

        // Listar autenticado como User 1
        $response = $this->actingAs($this->user1)->getJson('/api/sector-averages');

        $response->assertOk();
        $averages = $response->json('averages');

        // Deve conter 2 médias (a global e a do User 1, mas NÃO a do User 2)
        $this->assertCount(2, $averages);
        $this->assertEquals(0.0200, $averages[0]['average_kwh']);
        $this->assertEquals(0.0150, $averages[1]['average_kwh']);
        $this->assertEquals($this->user1->id, $averages[1]['user_id']);
    }

    public function test_above_average_alerts_scoped_individually_per_user(): void
    {
        // Limite manual baixo para User 1 (0.0100 kWh -> threshold 0.0130 kWh)
        SectorConsumptionAverage::create([
            'sector_name' => 'Setor_A',
            'user_id' => $this->user1->id,
            'average_kwh' => 0.0100,
            'is_manual_override' => true,
        ]);

        // Limite manual alto para User 2 (0.0500 kWh -> threshold 0.0650 kWh)
        SectorConsumptionAverage::create([
            'sector_name' => 'Setor_A',
            'user_id' => $this->user2->id,
            'average_kwh' => 0.0500,
            'is_manual_override' => true,
        ]);

        // Simular leitura do Firebase (23.11112 Wh -> 0.02311112 kWh após * 0.001)
        // 0.0231 está acima de 0.0130 (User 1), mas abaixo de 0.0650 (User 2)
        $sensorsData = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'energia_kwh' => 23.11112,
                'potencia' => 1200,
                'timestamp' => time(),
            ],
        ];

        $count = $this->service->detectAboveAverageFromHistory($sensorsData);

        // Somente 1 alerta deve ser criado
        $this->assertEquals(1, $count);

        // Deve existir alerta para o User 1, mas NÃO para o User 2
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user1->id,
            'type' => 'above_average',
        ]);
        $this->assertDatabaseMissing('alerts', [
            'user_id' => $this->user2->id,
            'type' => 'above_average',
        ]);
    }

    public function test_off_hours_alerts_created_for_all_violating_users_without_overwriting(): void
    {
        // Mock de fuso horário America/Sao_Paulo fora do horário (20:00:00 segunda-feira)
        Carbon::setTestNow(Carbon::parse('2026-06-08 20:00:00', 'America/Sao_Paulo'));
        $dayOfWeek = now('America/Sao_Paulo')->dayOfWeek;

        // Configurar horário comercial para User 1
        BusinessHour::create([
            'user_id' => $this->user1->id,
            'day_of_week' => $dayOfWeek,
            'enabled' => true,
            'start_time' => '08:00',
            'end_time' => '18:00',
        ]);

        // Configurar horário comercial para User 2
        BusinessHour::create([
            'user_id' => $this->user2->id,
            'day_of_week' => $dayOfWeek,
            'enabled' => true,
            'start_time' => '08:00',
            'end_time' => '18:00',
        ]);

        $sensorsData = [
            'Setor_A' => [
                'nome' => 'Refrigeracao',
                'energia_kwh' => 23.11,
                'potencia' => 500, // > 100W ativo
                'timestamp' => time(),
            ],
        ];

        $count = $this->service->detectOffHoursFromHistory($sensorsData);

        // Ambos os usuários devem receber alertas (2 alertas gerados)
        $this->assertEquals(2, $count);

        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user1->id,
            'type' => 'off_hours',
        ]);
        $this->assertDatabaseHas('alerts', [
            'user_id' => $this->user2->id,
            'type' => 'off_hours',
        ]);

        Carbon::setTestNow();
    }

    public function test_alerts_list_filtered_by_authenticated_user(): void
    {
        // Alerta pertencente ao User 1
        Alert::create([
            'user_id' => $this->user1->id,
            'type' => 'above_average',
            'severity' => 'high',
            'title' => 'Alerta do User 1',
            'message' => 'Consumo alto',
            'status' => 'open',
        ]);

        // Alerta pertencente ao User 2
        Alert::create([
            'user_id' => $this->user2->id,
            'type' => 'above_average',
            'severity' => 'high',
            'title' => 'Alerta do User 2',
            'message' => 'Consumo alto',
            'status' => 'open',
        ]);

        // Autenticado como User 1
        $response = $this->actingAs($this->user1)->getJson('/api/alerts');

        $response->assertOk();
        
        // Deve listar apenas o alerta do User 1
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Alerta do User 1', $data[0]['title']);
    }
}
