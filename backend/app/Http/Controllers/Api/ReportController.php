<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsumptionHistory;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * GET /api/reports/consumption-pdf
     *
     * Gera PDF com dados de consumo e custo de um setor específico.
     *
     * Query params:
     *   - sector_name (required): Nome do setor no Firebase (ex: Setor_A)
     *   - date_from (required): Data início (Y-m-d)
     *   - date_to (required): Data fim (Y-m-d)
     */
    public function consumptionPdf(Request $request)
    {
        $request->validate([
            'sector_name' => ['required', 'string'],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $sectorName = $request->query('sector_name');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        // 1. Calcular totais usando agregação direta no banco (previne estouro de memória PHP)
        $totalsQuery = ConsumptionHistory::where('sector_name', $sectorName)
            ->whereBetween('recorded_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        $totalRecords = (clone $totalsQuery)->count();
        $totalKwh = (clone $totalsQuery)->sum('energy_kwh') ?? 0;
        $totalCost = (clone $totalsQuery)->sum('cost_estimate') ?? 0;
        $avgPower = (clone $totalsQuery)->avg('power_w') ?? 0;
        $maxPower = (clone $totalsQuery)->max('power_w') ?? 0;
        $avgTariff = (clone $totalsQuery)->avg('tariff_used') ?? 0.85;

        // Obter o primeiro registro para rotular o setor
        $firstRecord = (clone $totalsQuery)->orderBy('recorded_at', 'asc')->first();
        $sectorLabel = $firstRecord?->sector_label ?? $sectorName;

        // 2. Definir o agrupamento de acordo com o intervalo de dias
        $daysCount = \Carbon\Carbon::parse($dateFrom)->diffInDays(\Carbon\Carbon::parse($dateTo)) + 1;
        $grouping = 'none';

        if ($daysCount > 7) {
            $grouping = 'daily';
            $records = ConsumptionHistory::where('sector_name', $sectorName)
                ->whereBetween('recorded_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->selectRaw("
                    strftime('%Y-%m-%d 00:00:00', recorded_at) as recorded_at,
                    AVG(power_w) as power_w,
                    SUM(energy_kwh) as energy_kwh,
                    SUM(cost_estimate) as cost_estimate,
                    AVG(tariff_used) as tariff_used
                ")
                ->groupByRaw("strftime('%Y-%m-%d', recorded_at)")
                ->orderBy('recorded_at', 'asc')
                ->get();
        } elseif ($daysCount > 1) {
            $grouping = 'hourly';
            $records = ConsumptionHistory::where('sector_name', $sectorName)
                ->whereBetween('recorded_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->selectRaw("
                    strftime('%Y-%m-%d %H:00:00', recorded_at) as recorded_at,
                    AVG(power_w) as power_w,
                    SUM(energy_kwh) as energy_kwh,
                    SUM(cost_estimate) as cost_estimate,
                    AVG(tariff_used) as tariff_used
                ")
                ->groupByRaw("strftime('%Y-%m-%d %H', recorded_at)")
                ->orderBy('recorded_at', 'asc')
                ->get();
        } else {
            $records = ConsumptionHistory::where('sector_name', $sectorName)
                ->whereBetween('recorded_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->orderBy('recorded_at', 'asc')
                ->get();
        }

        $data = [
            'sectorName' => $sectorName,
            'sectorLabel' => $sectorLabel,
            'dateFrom' => \Carbon\Carbon::parse($dateFrom)->format('d/m/Y'),
            'dateTo' => \Carbon\Carbon::parse($dateTo)->format('d/m/Y'),
            'generatedAt' => now()->format('d/m/Y H:i'),
            'records' => $records,
            'totalRecords' => $totalRecords,
            'totalKwh' => $totalKwh,
            'totalCost' => $totalCost,
            'avgPower' => $avgPower,
            'maxPower' => $maxPower,
            'avgTariff' => $avgTariff,
            'grouping' => $grouping,
        ];

        $pdf = Pdf::loadView('reports.consumption', $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = "relatorio_consumo_{$sectorName}_{$dateFrom}_{$dateTo}.pdf";

        return $pdf->download($filename);
    }


    /**
     * GET /api/reports/consumption-data
     *
     * Retorna dados de consumo em JSON (para preview no frontend).
     */
    public function consumptionData(Request $request): JsonResponse
    {
        $request->validate([
            'sector_name' => ['required', 'string'],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        $sectorName = $request->query('sector_name');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $records = ConsumptionHistory::where('sector_name', $sectorName)
            ->whereBetween('recorded_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('recorded_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'sector_name' => $sectorName,
            'sector_label' => $records->first()?->sector_label ?? $sectorName,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'total_records' => $records->count(),
            'total_kwh' => round($records->sum('energy_kwh'), 4),
            'total_cost' => round($records->sum('cost_estimate'), 2),
            'avg_power' => round($records->avg('power_w') ?? 0, 2),
            'max_power' => round($records->max('power_w') ?? 0, 2),
            'records' => $records->map(fn ($r) => [
                'recorded_at' => $r->recorded_at->format('Y-m-d H:i:s'),
                'power_w' => round($r->power_w, 2),
                'energy_kwh' => round($r->energy_kwh, 4),
                'cost_estimate' => round($r->cost_estimate, 2),
            ]),
        ]);
    }
}
