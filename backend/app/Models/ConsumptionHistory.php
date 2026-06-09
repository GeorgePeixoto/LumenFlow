<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsumptionHistory extends Model
{
    use HasFactory;

    protected $table = 'consumption_history';

    protected $fillable = [
        'sector_name',
        'sector_label',
        'firebase_device_id',
        'power_w',
        'energy_kwh',
        'cost_estimate',
        'tariff_used',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'power_w' => 'decimal:2',
            'energy_kwh' => 'decimal:4',
            'cost_estimate' => 'decimal:2',
            'tariff_used' => 'decimal:4',
            'recorded_at' => 'datetime',
        ];
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeForSector($query, string $sectorName)
    {
        return $query->where('sector_name', $sectorName);
    }

    public function scopeBetweenDates($query, string $from, string $to)
    {
        return $query->whereBetween('recorded_at', [$from, "$to 23:59:59"]);
    }
}
