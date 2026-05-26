<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sector_id' => $this->sector_id,
            'name' => $this->name,
            'type' => $this->type,
            'power_watts' => $this->power_watts,
            'status' => $this->status,
            'active' => $this->active,
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
