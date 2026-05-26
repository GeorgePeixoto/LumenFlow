<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'sector_id' => $this->sector_id,
            'device_id' => $this->device_id,
            'type' => $this->type,
            'severity' => $this->severity,
            'title' => $this->title,
            'message' => $this->message,
            'status' => $this->status,
            'acknowledged_at' => $this->acknowledged_at,
            'resolved_at' => $this->resolved_at,
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'device' => new DeviceResource($this->whenLoaded('device')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
