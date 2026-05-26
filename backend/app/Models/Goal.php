<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'scope',
        'sector_id',
        'device_id',
        'name',
        'unit',
        'value',
        'current_value',
        'period_start',
        'period_end',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'current_value' => 'decimal:2',
            'period_start' => 'date',
            'period_end' => 'date',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // ─── Computed ────────────────────────────────────────────

    public function getProgressAttribute(): float
    {
        if ($this->value == 0) {
            return 0;
        }

        return round(($this->current_value / $this->value) * 100, 1);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'active' && $this->period_end->isPast();
    }
}
