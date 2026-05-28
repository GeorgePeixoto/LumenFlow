<?php

namespace App\Services;

use Kreait\Firebase\Database;
use Illuminate\Support\Facades\Log;

class WokwiService
{
    protected $firebaseService;
    protected $database;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
        $this->database = $firebaseService->getDatabase();
    }

    /**
     * Salva dados de leitura do sensor no Firebase
     */
    public function saveSensorData(string $deviceId, array $data): bool
    {
        try {
            $path = "devices/{$deviceId}/readings";
            $newReference = $this->database->getReference($path)
                ->push($data);

            Log::info('Sensor data saved successfully', [
                'device_id' => $deviceId,
                'reading_id' => $newReference->getKey(),
                'data' => $data
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to save sensor data', [
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
                'data' => $data
            ]);

            return false;
        }
    }

    /**
     * Obtém as leituras mais recentes de um dispositivo
     */
    public function getLatestReadings(string $deviceId, int $limit = 10): array
    {
        try {
            $path = "devices/{$deviceId}/readings";
            $snapshot = $this->database->getReference($path)
                ->orderByChild('timestamp')
                ->limitToLast($limit)
                ->getSnapshot();

            $readings = [];
            foreach ($snapshot->getValue() as $key => $value) {
                $readings[] = array_merge($value, ['id' => $key]);
            }

            return array_reverse($readings);
        } catch (\Exception $e) {
            Log::error('Failed to get readings', [
                'device_id' => $deviceId,
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Obtém todos os dispositivos ativos
     */
    public function getActiveDevices(): array
    {
        try {
            $snapshot = $this->database->getReference('devices')->getSnapshot();
            return $snapshot->getValue() ?: [];
        } catch (\Exception $e) {
            Log::error('Failed to get active devices', [
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Salva status do dispositivo
     */
    public function saveDeviceStatus(string $deviceId, array $status): bool
    {
        try {
            $path = "devices/{$deviceId}/status";
            $this->database->getReference($path)->set($status);

            Log::info('Device status updated', [
                'device_id' => $deviceId,
                'status' => $status
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to save device status', [
                'device_id' => $deviceId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}