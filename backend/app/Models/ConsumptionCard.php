<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsumptionCard extends Model
{
    use HasFactory;

    protected $table = 'consumption_cards';

    protected $fillable = [
        'key',
        'accumulated_kwh',
        'accumulated_cost',
    ];

    protected function casts(): array
    {
        return [
            'accumulated_kwh' => 'double',
            'accumulated_cost' => 'double',
        ];
    }
}
