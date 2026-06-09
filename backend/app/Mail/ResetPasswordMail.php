<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;
    public string $userName;

    public function __construct(string $email, string $token, ?string $userName = null)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $this->resetUrl = "{$frontendUrl}/#/reset-password?token={$token}&email=" . urlencode($email);
        $this->userName = $userName ?? 'Usuário';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'LumenFlow — Recuperação de senha',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
            with: [
                'resetUrl' => $this->resetUrl,
                'userName' => $this->userName,
            ],
        );
    }
}
