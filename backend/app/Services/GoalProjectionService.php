<?php

namespace App\Services;

use App\Models\ConsumptionReading;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Support\Carbon;

class GoalProjectionService
{
    public function projectAll(User $user): array
    {
        $goals = $user->goals()->where('status', 'active')->get();

        return $goals->map(fn (Goal $goal) => $this->project($goal, $user))->toArray();
    }

    public function project(Goal $goal, User $user): array
    {
        $now = now();
        $periodStart = Carbon::parse($goal->period_start);
        $periodEnd = Carbon::parse($goal->period_end);

        $totalDays = $periodStart->diffInDays($periodEnd) ?: 1;
        $elapsedDays = $periodStart->diffInDays($now->min($periodEnd)) ?: 1;
        $remainingDays = max(0, $now->diffInDays($periodEnd, false));

        $currentValue = $this->calculateCurrentValue($goal, $user);

        $dailyRate = $elapsedDays > 0 ? $currentValue / $elapsedDays : 0;
        $projectedValue = round($dailyRate * $totalDays, 2);

        $progress = $goal->value > 0 ? round(($currentValue / $goal->value) * 100, 1) : 0;
        $projectedProgress = $goal->value > 0 ? round(($projectedValue / $goal->value) * 100, 1) : 0;

        $status = $this->determineProjectionStatus($goal, $projectedProgress);

        return [
            'goal_id' => $goal->id,
            'name' => $goal->name,
            'scope' => $goal->scope,
            'unit' => $goal->unit,
            'target_value' => (float) $goal->value,
            'current_value' => round($currentValue, 2),
            'projected_value' => $projectedValue,
            'daily_rate' => round($dailyRate, 4),
            'progress' => $progress,
            'projected_progress' => $projectedProgress,
            'days_elapsed' => $elapsedDays,
            'days_remaining' => $remainingDays,
            'days_total' => $totalDays,
            'projection_status' => $status,
            'period_start' => $goal->period_start->toDateString(),
            'period_end' => $goal->period_end->toDateString(),
        ];
    }

    private function calculateCurrentValue(Goal $goal, User $user): float
    {
        $periodStart = $goal->period_start;
        $periodEnd = now()->min($goal->period_end);

        if ($goal->unit === 'reais') {
            $kwh = $this->getConsumptionKwh($goal, $user, $periodStart, $periodEnd);
            $tariff = $user->tariffs()->where('active', true)->where('type', 'convencional')->first();
            $tariffValue = $tariff?->value_kwh ?? 0.657;
            return $kwh * $tariffValue;
        }

        if ($goal->unit === 'kwh') {
            return $this->getConsumptionKwh($goal, $user, $periodStart, $periodEnd);
        }

        // percent: usa current_value armazenado no model
        return (float) $goal->current_value;
    }

    private function getConsumptionKwh(Goal $goal, User $user, $from, $to): float
    {
        $query = ConsumptionReading::whereBetween('read_at', [$from, $to]);

        if ($goal->scope === 'device' && $goal->device_id) {
            $query->where('device_id', $goal->device_id);
        } elseif ($goal->scope === 'sector' && $goal->sector_id) {
            $query->where('sector_id', $goal->sector_id);
        } else {
            $sectorIds = $user->sectors()->pluck('id');
            $query->whereIn('sector_id', $sectorIds);
        }

        return (float) $query->sum('energy_kwh');
    }

    private function determineProjectionStatus(Goal $goal, float $projectedProgress): string
    {
        // Para metas de redução (ex: "gastar menos que X"), ultrapassar é ruim
        // Para metas de economia, ultrapassar é bom
        // Simplificação: assumimos que metas são limites máximos (consumo/custo)
        if ($projectedProgress >= 100) {
            return 'at_risk'; // vai ultrapassar a meta
        }

        if ($projectedProgress >= 80) {
            return 'warning'; // perto do limite
        }

        return 'on_track'; // dentro do esperado
    }
}
