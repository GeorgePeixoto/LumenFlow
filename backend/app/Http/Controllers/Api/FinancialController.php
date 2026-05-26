<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsumptionReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    /**
     * GET /api/financial/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());
        $user = $request->user();

        $sectorIds = $user->sectors()->pluck('id');
        $activeTariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
        $tariffValue = $activeTariff?->value_kwh ?? 0.657;

        // Bandeira ativa
        $flagTariff = $user->tariffs()->where('active', true)->where('type', 'bandeira')->first();
        $flagValue = $flagTariff?->value_kwh ?? 0;

        $totalKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->sum('energy_kwh');

        $totalCost = round($totalKwh * ($tariffValue + $flagValue), 2);

        // Mês anterior para comparação
        $prevFrom = now()->subMonth()->startOfMonth()->toDateString();
        $prevTo = now()->subMonth()->endOfMonth()->toDateString();

        $prevKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->whereBetween('read_at', [$prevFrom, "$prevTo 23:59:59"])
            ->sum('energy_kwh');

        $prevCost = round($prevKwh * ($tariffValue + $flagValue), 2);

        $variation = $prevCost > 0 ? round((($totalCost - $prevCost) / $prevCost) * 100, 1) : 0;

        return response()->json([
            'total_kwh' => round($totalKwh, 2),
            'total_cost' => $totalCost,
            'tariff_value' => $tariffValue,
            'flag_value' => $flagValue,
            'flag_color' => $flagTariff?->flag_color,
            'prev_cost' => $prevCost,
            'variation_percent' => $variation,
            'period' => ['from' => $from, 'to' => $to],
        ]);
    }

    /**
     * GET /api/financial/daily
     */
    public function daily(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());
        $user = $request->user();

        $sectorIds = $user->sectors()->pluck('id');
        $activeTariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
        $tariffValue = $activeTariff?->value_kwh ?? 0.657;

        $data = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->selectRaw('DATE(read_at) as date, SUM(energy_kwh) as total_kwh')
            ->groupByRaw('DATE(read_at)')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date' => $row->date,
                'total_kwh' => round($row->total_kwh, 2),
                'cost' => round($row->total_kwh * $tariffValue, 2),
            ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/financial/ranking
     */
    public function ranking(Request $request): JsonResponse
    {
        $request->validate([
            'by' => ['nullable', 'in:sector,device'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $by = $request->get('by', 'sector');
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());
        $user = $request->user();

        $sectorIds = $user->sectors()->pluck('id');
        $activeTariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
        $tariffValue = $activeTariff?->value_kwh ?? 0.657;

        if ($by === 'sector') {
            $data = ConsumptionReading::query()
                ->join('sectors', 'consumption_readings.sector_id', '=', 'sectors.id')
                ->whereIn('consumption_readings.sector_id', $sectorIds)
                ->whereBetween('read_at', [$from, "$to 23:59:59"])
                ->groupBy('sectors.id', 'sectors.name')
                ->selectRaw('sectors.id, sectors.name, SUM(energy_kwh) as total_kwh')
                ->orderByDesc('total_kwh')
                ->get()
                ->map(fn($row) => [
                    'id' => $row->id,
                    'name' => $row->name,
                    'total_kwh' => round($row->total_kwh, 2),
                    'cost' => round($row->total_kwh * $tariffValue, 2),
                ]);
        } else {
            $data = ConsumptionReading::query()
                ->join('devices', 'consumption_readings.device_id', '=', 'devices.id')
                ->whereIn('consumption_readings.sector_id', $sectorIds)
                ->whereBetween('read_at', [$from, "$to 23:59:59"])
                ->groupBy('devices.id', 'devices.name')
                ->selectRaw('devices.id, devices.name, SUM(energy_kwh) as total_kwh')
                ->orderByDesc('total_kwh')
                ->limit(10)
                ->get()
                ->map(fn($row) => [
                    'id' => $row->id,
                    'name' => $row->name,
                    'total_kwh' => round($row->total_kwh, 2),
                    'cost' => round($row->total_kwh * $tariffValue, 2),
                ]);
        }

        return response()->json(['ranking' => $data]);
    }
}
