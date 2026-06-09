<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Relatório de Consumo — {{ $sectorLabel }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            line-height: 1.5;
            background: #fff;
        }

        .header {
            background: linear-gradient(135deg, #059669, #047857);
            color: #fff;
            padding: 24px 30px;
            margin-bottom: 20px;
        }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { font-size: 11px; opacity: 0.9; }

        .meta-section {
            padding: 0 30px;
            margin-bottom: 20px;
        }
        .meta-grid {
            width: 100%;
            border-collapse: collapse;
        }
        .meta-grid td {
            padding: 6px 12px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .meta-grid td.label {
            background: #f3f4f6;
            font-weight: bold;
            width: 140px;
            color: #374151;
        }

        .content { padding: 0 30px; }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
            padding-bottom: 4px;
            border-bottom: 2px solid #059669;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }
        table.data-table thead th {
            background: #1a1a2e;
            color: #fff;
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
        }
        table.data-table tbody td {
            padding: 6px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        table.data-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        table.data-table tbody tr:hover {
            background: #ecfdf5;
        }

        .summary-box {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            padding: 16px 20px;
            margin-top: 20px;
        }
        .summary-box h3 {
            font-size: 13px;
            color: #047857;
            margin-bottom: 8px;
        }
        .summary-grid {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-grid td {
            padding: 4px 8px;
            font-size: 11px;
        }
        .summary-grid td.label {
            font-weight: bold;
            color: #374151;
            width: 180px;
        }
        .summary-grid td.value {
            font-weight: bold;
            color: #059669;
            font-size: 13px;
        }

        .footer {
            margin-top: 30px;
            padding: 12px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #9ca3af;
            font-size: 14px;
        }

        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ LumenFlow — Relatório de Consumo</h1>
        <p>Setor: {{ $sectorLabel }} | Gerado em {{ $generatedAt }}</p>
    </div>

    <div class="meta-section">
        <table class="meta-grid">
            <tr>
                <td class="label">Setor</td>
                <td>{{ $sectorLabel }}</td>
                <td class="label">Período</td>
                <td>{{ $dateFrom }} — {{ $dateTo }}</td>
            </tr>
            <tr>
                <td class="label">Total de Registros</td>
                <td>{{ $totalRecords }}</td>
                <td class="label">Tarifa Média</td>
                <td>R$ {{ number_format($avgTariff, 4, ',', '.') }}/kWh</td>
            </tr>
        </table>
    </div>

    <div class="content">
        <h2 class="section-title">Dados de Consumo</h2>

        @if($records->count() > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Potência (W)</th>
                    <th>Energia (kWh)</th>
                    <th>Custo (R$)</th>
                    <th>Tarifa (R$/kWh)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($records as $record)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($record->recorded_at)->format('d/m/Y H:i') }}</td>
                    <td class="text-right">{{ number_format($record->power_w, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($record->energy_kwh, 4, ',', '.') }}</td>
                    <td class="text-right">R$ {{ number_format($record->cost_estimate, 2, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($record->tariff_used, 4, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-box">
            <h3>Resumo do Período</h3>
            <table class="summary-grid">
                <tr>
                    <td class="label">Total de Energia Consumida:</td>
                    <td class="value">{{ number_format($totalKwh, 4, ',', '.') }} kWh</td>
                </tr>
                <tr>
                    <td class="label">Custo Total Estimado:</td>
                    <td class="value">R$ {{ number_format($totalCost, 2, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="label">Potência Média:</td>
                    <td class="value">{{ number_format($avgPower, 2, ',', '.') }} W</td>
                </tr>
                <tr>
                    <td class="label">Potência Máxima Registrada:</td>
                    <td class="value">{{ number_format($maxPower, 2, ',', '.') }} W</td>
                </tr>
            </table>
        </div>
        @else
        <div class="no-data">
            Nenhum registro de consumo encontrado para o período selecionado.
        </div>
        @endif
    </div>

    <div class="footer">
        LumenFlow — Sistema de Monitoramento Energético | Relatório gerado automaticamente em {{ $generatedAt }}
    </div>
</body>
</html>
