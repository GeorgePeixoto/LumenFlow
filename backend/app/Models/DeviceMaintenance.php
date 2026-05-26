<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceMaintenance extends Model
{
    protected $fillable = ['device_id', 'date', 'type', 'notes'];

    protected $casts = [
        'date' => 'date',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
