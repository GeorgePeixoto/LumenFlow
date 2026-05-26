<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'sector_id',
        'name',
        'type',
        'power_watts',
        'active',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'power_watts' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function consumptionReadings(): HasMany
    {
        return $this->hasMany(ConsumptionReading::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(DeviceMaintenance::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }
}
