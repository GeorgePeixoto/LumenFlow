<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'threshold_yellow' => $this->threshold_yellow,
            'threshold_red' => $this->threshold_red,
            'active' => $this->active,
            'devices_count' => $this->whenCounted('devices'),
            'devices' => DeviceResource::collection($this->whenLoaded('devices')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
