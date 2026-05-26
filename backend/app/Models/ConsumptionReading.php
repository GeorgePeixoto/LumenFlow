<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsumptionReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'sector_id',
        'power_w',
        'energy_kwh',
        'corrente',
        'tensao',
        'fator_pf',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'power_w' => 'decimal:2',
            'energy_kwh' => 'decimal:4',
            'corrente' => 'decimal:3',
            'tensao' => 'decimal:2',
            'fator_pf' => 'decimal:3',
            'read_at' => 'datetime',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }
}
