<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsumptionReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsumptionController extends Controller
{
    /**
     * GET /api/consumption — leituras com filtros
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
            'device_id' => ['nullable', 'integer', 'exists:devices,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = ConsumptionReading::query()
            ->whereHas('sector', fn($q) => $q->where('user_id', $request->user()->id));

        if ($request->sector_id) {
            $query->where('sector_id', $request->sector_id);
        }

        if ($request->device_id) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->from) {
            $query->where('read_at', '>=', $request->from);
        }

        if ($request->to) {
            $query->where('read_at', '<=', $request->to);
        }

        $readings = $query->orderByDesc('read_at')->paginate(50);

        return response()->json($readings);
    }

    /**
     * GET /api/consumption/summary — resumo para dashboard
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'period' => ['nullable', 'in:today,week,month'],
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
        ]);

        $period = $request->get('period', 'today');
        $userId = $request->user()->id;

        $query = ConsumptionReading::query()
            ->whereHas('sector', fn($q) => $q->where('user_id', $userId));

        if ($request->sector_id) {
            $query->where('sector_id', $request->sector_id);
        }

        $query->where('read_at', '>=', match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
        });

        $summary = $query->selectRaw('
            COALESCE(SUM(energy_kwh), 0) as total_kwh,
            COALESCE(AVG(power_w), 0) as avg_power_w,
            COALESCE(MAX(power_w), 0) as peak_power_w,
            COUNT(*) as total_readings
        ')->first();

        return response()->json(['summary' => $summary]);
    }

    /**
     * GET /api/consumption/by-sector — consumo agrupado por setor
     */
    public function bySector(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());

        $data = ConsumptionReading::query()
            ->join('sectors', 'consumption_readings.sector_id', '=', 'sectors.id')
            ->where('sectors.user_id', $request->user()->id)
            ->whereBetween('read_at', [$from, $to])
            ->groupBy('sectors.id', 'sectors.name')
            ->selectRaw('sectors.id as sector_id, sectors.name as sector_name, SUM(energy_kwh) as total_kwh')
            ->orderByDesc('total_kwh')
            ->get();

        return response()->json(['by_sector' => $data]);
    }

    /**
     * GET /api/consumption/hourly — consumo por hora (para gráficos)
     */
    public function hourly(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['nullable', 'date'],
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
        ]);

        $date = $request->get('date', now()->toDateString());

        $query = ConsumptionReading::query()
            ->whereHas('sector', fn($q) => $q->where('user_id', $request->user()->id))
            ->whereDate('read_at', $date);

        if ($request->sector_id) {
            $query->where('sector_id', $request->sector_id);
        }

        $data = $query
            ->selectRaw('HOUR(read_at) as hour, SUM(energy_kwh) as total_kwh, AVG(power_w) as avg_power_w')
            ->groupByRaw('HOUR(read_at)')
            ->orderBy('hour')
            ->get();

        return response()->json(['hourly' => $data]);
    }
}
