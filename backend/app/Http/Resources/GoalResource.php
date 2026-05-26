<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'scope' => $this->scope,
            'sector_id' => $this->sector_id,
            'device_id' => $this->device_id,
            'name' => $this->name,
            'unit' => $this->unit,
            'value' => $this->value,
            'current_value' => $this->current_value,
            'progress' => $this->value > 0 ? round(($this->current_value / $this->value) * 100, 1) : 0,
            'period_start' => $this->period_start,
            'period_end' => $this->period_end,
            'status' => $this->status,
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
