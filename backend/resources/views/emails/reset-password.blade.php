<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha — LumenFlow</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0fdf4;
            color: #1a1a2e;
        }
        .container {
            max-width: 560px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #059669, #047857);
            padding: 32px 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0 0 4px 0;
        }
        .header p {
            color: rgba(255,255,255,0.85);
            font-size: 13px;
            margin: 0;
        }
        .body {
            padding: 32px 40px;
        }
        .body p {
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            margin: 0 0 16px 0;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0;
        }
        .btn {
            display: inline-block;
            background: #059669;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .link-fallback {
            font-size: 12px;
            color: #9ca3af;
            word-break: break-all;
            margin-top: 16px;
        }
        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 24px 0;
        }
        .footer {
            padding: 20px 40px;
            background: #f9fafb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 13px;
            color: #92400e;
            margin: 16px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ LumenFlow</h1>
            <p>Recuperação de Senha</p>
        </div>

        <div class="body">
            <p>Olá, <strong>{{ $userName }}</strong>!</p>

            <p>Recebemos uma solicitação para redefinir a senha da sua conta LumenFlow. Clique no botão abaixo para criar uma nova senha:</p>

            <div class="btn-container">
                <a href="{{ $resetUrl }}" class="btn">Redefinir minha senha</a>
            </div>

            <div class="warning">
                ⏰ Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, ignore este e-mail.
            </div>

            <hr class="divider">

            <p class="link-fallback">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                <a href="{{ $resetUrl }}" style="color: #059669;">{{ $resetUrl }}</a>
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} LumenFlow. Todos os direitos reservados.<br>
            Sistema de Monitoramento Energético
        </div>
    </div>
</body>
</html>
