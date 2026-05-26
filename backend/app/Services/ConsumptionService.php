<?php

namespace App\Services;

use App\Models\ConsumptionReading;
use App\Models\User;
use Illuminate\Support\Carbon;

class ConsumptionService
{
    /**
     * Calcula KPIs de consumo para o usuário.
     */
    public function getKpis(User $user): array
    {
        $sectorIds = $user->sectors()->pluck('id');
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        // Consumo hoje
        $todayKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->where('read_at', '>=', $today)
            ->sum('energy_kwh');

        // Consumo mês atual
        $monthKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->where('read_at', '>=', $monthStart)
            ->sum('energy_kwh');

        // Consumo mês anterior (para variação)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();
        $prevMonthKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->whereBetween('read_at', [$prevMonthStart, $prevMonthEnd->endOfDay()])
            ->sum('energy_kwh');

        // Variação percentual
        $consumptionVariation = $prevMonthKwh > 0
            ? round(($monthKwh - $prevMonthKwh) / $prevMonthKwh, 4)
            : 0;

        // Potência atual (última leitura)
        $currentPower = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->orderByDesc('read_at')
            ->value('power_w') ?? 0;

        // Custo estimado do mês
        $tariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
        $tariffValue = $tariff?->value_kwh ?? 0.657;
        $monthlyCost = round($monthKwh * $tariffValue, 2);

        // Custo mês anterior
        $prevCost = round($prevMonthKwh * $tariffValue, 2);
        $costVariation = $prevCost > 0
            ? round(($monthlyCost - $prevCost) / $prevCost, 4)
            : 0;

        // Alertas abertos
        $openAlerts = $user->alerts()->where('status', 'open')->count();

        // Devices ativos
        $activeDevices = $user->sectors()
            ->with('devices')
            ->get()
            ->pluck('devices')
            ->flatten()
            ->where('active', true)
            ->count();

        return [
            'today_kwh' => round($todayKwh, 2),
            'month_kwh' => round($monthKwh, 2),
            'consumption_variation' => $consumptionVariation,
            'current_power_w' => round($currentPower, 2),
            'monthly_cost' => $monthlyCost,
            'cost_variation' => $costVariation,
            'tariff_value' => $tariffValue,
            'open_alerts' => $openAlerts,
            'active_devices' => $activeDevices,
        ];
    }

    /**
     * Retorna consumo agrupado por período (para gráficos).
     */
    public function getConsumptionChart(User $user, string $from, string $to, string $granularity = 'day'): array
    {
        $sectorIds = $user->sectors()->pluck('id');

        $groupBy = match ($granularity) {
            'hour' => "DATE_FORMAT(read_at, '%Y-%m-%d %H:00')",
            'day' => 'DATE(read_at)',
            'week' => "DATE_FORMAT(read_at, '%x-W%v')",
            'month' => "DATE_FORMAT(read_at, '%Y-%m')",
        };

        return ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->selectRaw("{$groupBy} as period, SUM(energy_kwh) as total_kwh, AVG(power_w) as avg_power_w")
            ->groupByRaw($groupBy)
            ->orderByRaw($groupBy)
            ->get()
            ->toArray();
    }

    /**
     * Retorna ranking de setores por consumo.
     */
    public function getTopSectors(User $user, string $from, string $to, int $limit = 5): array
    {
        return ConsumptionReading::query()
            ->join('sectors', 'consumption_readings.sector_id', '=', 'sectors.id')
            ->where('sectors.user_id', $user->id)
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->groupBy('sectors.id', 'sectors.name')
            ->selectRaw('sectors.id, sectors.name, SUM(energy_kwh) as total_kwh')
            ->orderByDesc('total_kwh')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Projeção de consumo para o fim do mês baseado na média diária.
     */
    public function getMonthlyProjection(User $user): array
    {
        $sectorIds = $user->sectors()->pluck('id');
        $monthStart = now()->startOfMonth();
        $daysElapsed = now()->diffInDays($monthStart) + 1;
        $daysInMonth = now()->daysInMonth;

        $monthKwh = ConsumptionReading::whereIn('sector_id', $sectorIds)
            ->where('read_at', '>=', $monthStart)
            ->sum('energy_kwh');

        $dailyAvg = $daysElapsed > 0 ? $monthKwh / $daysElapsed : 0;
        $projectedKwh = round($dailyAvg * $daysInMonth, 2);

        $tariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
        $tariffValue = $tariff?->value_kwh ?? 0.657;
        $projectedCost = round($projectedKwh * $tariffValue, 2);

        return [
            'current_kwh' => round($monthKwh, 2),
            'daily_avg_kwh' => round($dailyAvg, 2),
            'projected_kwh' => $projectedKwh,
            'projected_cost' => $projectedCost,
            'days_elapsed' => $daysElapsed,
            'days_in_month' => $daysInMonth,
        ];
    }

    /**
     * Consumo acumulado por setor no período.
     */
    public function getAccumulatedBySector(User $user, string $from, string $to): array
    {
        return ConsumptionReading::query()
            ->join('sectors', 'consumption_readings.sector_id', '=', 'sectors.id')
            ->where('sectors.user_id', $user->id)
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->groupBy('sectors.id', 'sectors.name')
            ->selectRaw('sectors.id, sectors.name, SUM(energy_kwh) as total_kwh, SUM(power_w) as total_power_w, COUNT(*) as readings_count')
            ->orderByDesc('total_kwh')
            ->get()
            ->toArray();
    }
}
