<?php

namespace App\Mail;

use App\Models\Alert;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlertNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Alert $alert;

    public function __construct(Alert $alert)
    {
        $this->alert = $alert;
        $this->alert->load(['user', 'sector', 'device']);
    }

    public function envelope(): Envelope
    {
        $severityLabel = match ($this->alert->severity) {
            'high' => 'Alto',
            'medium' => 'Médio',
            'low' => 'Baixo',
            default => ucfirst($this->alert->severity),
        };

        return new Envelope(
            subject: "⚡ Alerta LumenFlow [{$severityLabel}]: {$this->alert->title}",
        );
    }

    public function content(): Content
    {
        $alertUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/#/alerts';

        $headerBg = match ($this->alert->severity) {
            'high' => '#dc2626', // Vermelho
            'medium' => '#d97706', // Laranja
            default => '#2563eb', // Azul
        };

        return new Content(
            view: 'emails.alert-notification',
            with: [
                'alert' => $this->alert,
                'userName' => $this->alert->user->name ?? 'Usuário',
                'alertUrl' => $alertUrl,
                'headerBg' => $headerBg,
            ],
        );
    }
}
