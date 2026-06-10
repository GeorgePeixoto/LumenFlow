<?php

namespace Tests\Feature;

use App\Models\ConsumptionHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_requires_authentication(): void
    {
        $response = $this->get('/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-10');
        $response->assertStatus(401);
    }

    public function test_authentication_via_query_token(): void
    {
        $user = User::factory()->create(['email' => 'joao@test.com']);
        $token = 'fake-token-joao@test.com';

        $response = $this->get("/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-10&token=$token");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_consumption_pdf_no_records(): void
    {
        $response = $this->actingAs($this->user)->get('/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-10');
        
        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_consumption_pdf_single_day_no_grouping(): void
    {
        // Criar registro para o dia
        ConsumptionHistory::create([
            'sector_name' => 'Setor_A',
            'sector_label' => 'Setor A',
            'firebase_device_id' => 'dev1',
            'power_w' => 1200.50,
            'energy_kwh' => 2.45,
            'cost_estimate' => 1.50,
            'tariff_used' => 0.85,
            'recorded_at' => '2026-06-01 10:15:00',
        ]);

        $response = $this->actingAs($this->user)->get('/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-01');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_consumption_pdf_multi_day_hourly_grouping(): void
    {
        // Criar registros em 3 dias diferentes
        for ($day = 1; $day <= 3; $day++) {
            ConsumptionHistory::create([
                'sector_name' => 'Setor_A',
                'sector_label' => 'Setor A',
                'firebase_device_id' => 'dev1',
                'power_w' => 1000 + ($day * 100),
                'energy_kwh' => 1.5 * $day,
                'cost_estimate' => 1.2 * $day,
                'tariff_used' => 0.85,
                'recorded_at' => "2026-06-0$day 14:00:00",
            ]);
        }

        $response = $this->actingAs($this->user)->get('/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-03');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_consumption_pdf_long_range_daily_grouping(): void
    {
        // Criar registros espalhados em 10 dias
        for ($day = 1; $day <= 10; $day++) {
            $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
            ConsumptionHistory::create([
                'sector_name' => 'Setor_A',
                'sector_label' => 'Setor A',
                'firebase_device_id' => 'dev1',
                'power_w' => 1500,
                'energy_kwh' => 3.0,
                'cost_estimate' => 2.5,
                'tariff_used' => 0.85,
                'recorded_at' => "2026-06-$dayStr 12:00:00",
            ]);
        }

        $response = $this->actingAs($this->user)->get('/api/reports/consumption-pdf?sector_name=Setor_A&date_from=2026-06-01&date_to=2026-06-10');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
