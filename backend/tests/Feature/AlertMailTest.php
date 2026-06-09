<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\User;
use App\Mail\AlertNotificationMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AlertMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_notify_endpoint_sends_notification_email(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'enzoalminolima@gmail.com']);

        $alert = Alert::create([
            'user_id' => $user->id,
            'type' => 'above_average',
            'severity' => 'high',
            'title' => 'Consumo crítico',
            'message' => 'O consumo do Setor A está acima de 130%',
            'status' => 'open',
        ]);

        $response = $this->actingAs($user)->postJson("/api/alerts/{$alert->id}/notify");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Notification email sent successfully.']);

        Mail::assertSent(AlertNotificationMail::class, function ($mail) use ($user, $alert) {
            return $mail->hasTo($user->email) &&
                   $mail->alert->id === $alert->id &&
                   $mail->alert->title === 'Consumo crítico';
        });
    }

    public function test_notify_endpoint_requires_correct_owner(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'enzoalminolima@gmail.com']);
        $otherUser = User::factory()->create(['email' => 'other@gmail.com']);

        $alert = Alert::create([
            'user_id' => $user->id,
            'type' => 'above_average',
            'severity' => 'high',
            'title' => 'Consumo crítico',
            'message' => 'O consumo do Setor A está acima de 130%',
            'status' => 'open',
        ]);

        $response = $this->actingAs($otherUser)->postJson("/api/alerts/{$alert->id}/notify");

        $response->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized.']);

        Mail::assertNothingSent();
    }
}
