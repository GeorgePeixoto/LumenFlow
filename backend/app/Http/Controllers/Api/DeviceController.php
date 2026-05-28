<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Device\StoreDeviceRequest;
use App\Http\Requests\Device\UpdateDeviceRequest;
use App\Http\Resources\DeviceResource;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request, \App\Services\FirebaseRtdbService $firebaseService): JsonResponse
    {
        $user = $request->user();

        // 1. Sync from Firebase
        $result = $firebaseService->getAllDevicesData();
        if ($result['success'] && isset($result['data']['latest_readings'])) {
            $firebaseDevices = $result['data']['latest_readings'];
            $devicesStatus = $result['data']['devices_status'] ?? [];

            // Obter ou criar o primeiro setor do usuário
            $defaultSector = \App\Models\Sector::where('user_id', $user->id)->first();
            if (!$defaultSector) {
                $defaultSector = \App\Models\Sector::create([
                    'user_id' => $user->id,
                    'name' => 'Setor Principal',
                    'description' => 'Setor criado automaticamente para novos dispositivos.',
                    'active' => true,
                ]);
            }

            foreach ($firebaseDevices as $deviceId => $reading) {
                $status = !empty($devicesStatus[$deviceId]['active']) ? 'online' : 'offline';
                
                $device = Device::where('firebase_id', $deviceId)->first();
                if (!$device) {
                    Device::create([
                        'firebase_id' => $deviceId,
                        'name' => $reading['nome'] ?? $deviceId,
                        'power_watts' => $reading['potencia'] ?? null,
                        'status' => $status,
                        'sector_id' => $defaultSector->id,
                        'type' => 'sensor',
                    ]);
                } else {
                    $device->update([
                        'power_watts' => $reading['potencia'] ?? $device->power_watts,
                        'status' => $status,
                    ]);
                }
            }
        }

        // 2. Fetch user's devices
        $devices = Device::whereHas('sector', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with('sector:id,name')
            ->orderBy('name')
            ->get();

        return response()->json(['devices' => DeviceResource::collection($devices)]);
    }

    public function store(StoreDeviceRequest $request): JsonResponse
    {
        $device = Device::create($request->validated());

        return response()->json(['device' => new DeviceResource($device)], 201);
    }

    public function show(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $device->load('sector:id,name');

        return response()->json(['device' => new DeviceResource($device)]);
    }

    public function update(UpdateDeviceRequest $request, Device $device): JsonResponse
    {
        $device->update($request->validated());

        return response()->json(['device' => new DeviceResource($device)]);
    }

    public function destroy(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $device->delete();

        return response()->json(['message' => 'Dispositivo removido com sucesso.']);
    }

    public function readings(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'granularity' => ['nullable', 'in:hour,day,week'],
        ]);

        $from = $request->get('from', now()->subDays(7)->toDateString());
        $to = $request->get('to', now()->toDateString());
        $granularity = $request->get('granularity', 'hour');

        $groupBy = match ($granularity) {
            'hour' => "DATE_FORMAT(read_at, '%Y-%m-%d %H:00')",
            'day' => 'DATE(read_at)',
            'week' => "DATE_FORMAT(read_at, '%x-W%v')",
        };

        $data = $device->consumptionReadings()
            ->whereBetween('read_at', [$from, "$to 23:59:59"])
            ->selectRaw("{$groupBy} as period, SUM(energy_kwh) as total_kwh, AVG(power_w) as avg_power_w, MAX(power_w) as peak_power_w")
            ->groupByRaw($groupBy)
            ->orderByRaw($groupBy)
            ->get();

        return response()->json(['data' => $data]);
    }

    public function anomalies(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $from = $request->get('from', now()->subDays(30)->toDateString());
        $to = $request->get('to', now()->toDateString());

        $alerts = $device->alerts()
            ->whereIn('type', ['anomaly', 'overload'])
            ->whereBetween('created_at', [$from, "$to 23:59:59"])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['anomalies' => $alerts]);
    }

    public function maintenance(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $records = $device->maintenances()->orderByDesc('date')->get();

        return response()->json(['records' => $records]);
    }

    public function storeMaintenance(Request $request, Device $device): JsonResponse
    {
        $this->authorizeUser($request, $device);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $record = $device->maintenances()->create($validated);

        return response()->json(['record' => $record], 201);
    }

    private function authorizeUser(Request $request, Device $device): void
    {
        if ($device->sector->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado.');
        }
    }
}
