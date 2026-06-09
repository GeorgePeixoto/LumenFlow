<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificação de Alerta — LumenFlow</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
        }
        .container {
            max-width: 560px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .header {
            background: {{ $headerBg }};
            padding: 28px 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0 0 4px 0;
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 13px;
            margin: 0;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
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
        .alert-card {
            background-color: #f9fafb;
            border-left: 4px solid {{ $headerBg }};
            border-radius: 0 8px 8px 0;
            padding: 20px;
            margin: 24px 0;
        }
        .alert-field {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .alert-field:last-child {
            margin-bottom: 0;
        }
        .field-label {
            font-weight: 600;
            color: #4b5563;
            display: inline-block;
            width: 120px;
        }
        .field-value {
            color: #111827;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 16px 0;
        }
        .btn {
            display: inline-block;
            background: #1f2937;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ LumenFlow</h1>
            <p>Notificação de Alerta</p>
        </div>

        <div class="body">
            <p>Olá, <strong>{{ $userName }}</strong>!</p>

            <p>Um novo alerta foi registrado na central de monitoramento energético do LumenFlow. Veja os detalhes abaixo:</p>

            <div class="alert-card">
                <div class="alert-field">
                    <span class="field-label">Título:</span>
                    <span class="field-value"><strong>{{ $alert->title }}</strong></span>
                </div>
                <div class="alert-field">
                    <span class="field-label">Mensagem:</span>
                    <span class="field-value">{{ $alert->message }}</span>
                </div>
                <div class="alert-field">
                    <span class="field-label">Setor:</span>
                    <span class="field-value">{{ $alert->sector?->name ?? 'Não especificado' }}</span>
                </div>
                @if($alert->device)
                <div class="alert-field">
                    <span class="field-label">Equipamento:</span>
                    <span class="field-value">{{ $alert->device?->name }}</span>
                </div>
                @endif
                <div class="alert-field">
                    <span class="field-label">Severidade:</span>
                    <span class="field-value">
                        @if($alert->severity === 'high')
                            <span style="color: #dc2626; font-weight: 600;">Alto</span>
                        @elseif($alert->severity === 'medium')
                            <span style="color: #d97706; font-weight: 600;">Médio</span>
                        @else
                            <span style="color: #2563eb; font-weight: 600;">Baixo</span>
                        @endif
                    </span>
                </div>
                <div class="alert-field">
                    <span class="field-label">Data/Hora:</span>
                    <span class="field-value">{{ $alert->created_at->timezone('America/Sao_Paulo')->format('d/m/Y H:i:s') }}</span>
                </div>
            </div>

            <div class="btn-container">
                <a href="{{ $alertUrl }}" class="btn">Acessar Central de Alertas</a>
            </div>

            <hr class="divider">
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} LumenFlow. Todos os direitos reservados.<br>
            Monitoramento de Consumo de Energia Inteligente
        </div>
    </div>
</body>
</html>
