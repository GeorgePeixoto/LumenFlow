<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SectorConsumptionAverage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sector_name',
        'average_kwh',
        'is_manual_override',
        'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'average_kwh' => 'decimal:4',
            'is_manual_override' => 'boolean',
            'calculated_at' => 'datetime',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeForSector($query, string $sectorName)
    {
        return $query->where('sector_name', $sectorName);
    }

    public function scopeManual($query)
    {
        return $query->where('is_manual_override', true);
    }

    public function scopeAutomatic($query)
    {
        return $query->where('is_manual_override', false);
    }
}
