<?php

namespace App\Services;

use App\Models\ConsumptionReading;
use App\Models\Device;
use App\Models\Sector;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseSyncService
{
    private string $rtdbUrl;

    /**
     * Mapeamento dos setores do Firebase (Setor_A, Setor_B, etc.)
     * para os nomes dos setores no MySQL.
     */
    private array $sectorMap = [
        'Setor_A' => 'Refrigeracao',
        'Setor_B' => 'Iluminacao',
        'Setor_C' => 'Equipamentos',
        'Setor_D' => 'Escritorio',
    ];

    public function __construct()
    {
        $this->rtdbUrl = rtrim(config('firebase.rtdb_url'), '/');
    }

    /**
     * Sincroniza leituras do Firebase RTDB para o MySQL.
     * Lê /sensores (dados por setor) e /equipamentos (dados por device).
     */
    public function syncReadings(?int $sectorId = null): array
    {
        try {
            $synced = 0;

            // Sync por setores (/sensores/Setor_A, Setor_B, etc.)
            $synced += $this->syncSensores($sectorId);

            // Sync por equipamentos (/equipamentos/*)
            $synced += $this->syncEquipamentos($sectorId);

            if ($synced === 0) {
                return ['synced' => 0, 'message' => 'Nenhum dado novo no Firebase'];
            }

            return ['synced' => $synced, 'message' => "Sincronizados {$synced} registros"];

        } catch (\Exception $e) {
            Log::error('FirebaseSync: exceção', ['message' => $e->getMessage()]);
            return ['synced' => 0, 'error' => $e->getMessage()];
        }
    }

    /**
     * Sincroniza dados do nó /sensores (agrupados por setor).
     * Estrutura: /sensores/Setor_A { nome, potencia, energia_kwh, timestamp }
     */
    private function syncSensores(?int $sectorId): int
    {
        $url = "{$this->rtdbUrl}/sensores.json";
        $response = Http::timeout(15)->get($url);

        if ($response->failed() || empty($response->json())) {
            return 0;
        }

        $data = $response->json();
        $count = 0;

        foreach ($data as $key => $reading) {
            if (!is_array($reading)) {
                continue;
            }

            // Resolve setor pelo nome (Setor_A → Refrigeracao → sector_id)
            $sectorName = $this->sectorMap[$key] ?? $reading['nome'] ?? null;
            if (!$sectorName) {
                continue;
            }

            $sector = Sector::where('name', $sectorName)->first();
            if (!$sector) {
                continue;
            }

            // Se filtro por sector_id, pula os outros
            if ($sectorId && $sector->id !== $sectorId) {
                continue;
            }

            $readAt = $this->parseTimestamp($reading['timestamp'] ?? null);
            if (!$readAt) {
                continue;
            }

            // Evita duplicatas
            $exists = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', $readAt)
                ->whereNull('device_id')
                ->exists();

            if ($exists) {
                continue;
            }

            ConsumptionReading::create([
                'sector_id' => $sector->id,
                'device_id' => null,
                'power_w' => $reading['potencia'] ?? 0,
                'energy_kwh' => $reading['energia_kwh'] ?? 0,
                'corrente' => null,
                'tensao' => null,
                'fator_pf' => null,
                'read_at' => $readAt,
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Sincroniza dados do nó /equipamentos (por device individual).
     * Estrutura: /equipamentos/{device_id} { nome, setor, tensao, corrente, potencia, energia_kwh, fator_pf, timestamp }
     */
    private function syncEquipamentos(?int $sectorId): int
    {
        $url = "{$this->rtdbUrl}/equipamentos.json";
        $response = Http::timeout(15)->get($url);

        if ($response->failed() || empty($response->json())) {
            return 0;
        }

        $data = $response->json();
        $count = 0;

        foreach ($data as $deviceKey => $reading) {
            if (!is_array($reading)) {
                continue;
            }

            // Resolve setor pelo nome
            $sectorName = $reading['setor'] ?? null;
            if (!$sectorName) {
                continue;
            }

            $sector = Sector::where('name', $sectorName)->first();
            if (!$sector) {
                continue;
            }

            if ($sectorId && $sector->id !== $sectorId) {
                continue;
            }

            // Resolve device pelo nome
            $device = Device::where('sector_id', $sector->id)
                ->where('name', $reading['nome'] ?? '')
                ->first();

            $readAt = $this->parseTimestamp($reading['timestamp'] ?? null);
            if (!$readAt) {
                continue;
            }

            // Evita duplicatas
            $query = ConsumptionReading::where('sector_id', $sector->id)
                ->where('read_at', $readAt);

            if ($device) {
                $query->where('device_id', $device->id);
            }

            if ($query->exists()) {
                continue;
            }

            ConsumptionReading::create([
                'sector_id' => $sector->id,
                'device_id' => $device?->id,
                'power_w' => $reading['potencia'] ?? 0,
                'energy_kwh' => $reading['energia_kwh'] ?? 0,
                'corrente' => $reading['corrente'] ?? null,
                'tensao' => $reading['tensao'] ?? null,
                'fator_pf' => $reading['fator_pf'] ?? null,
                'read_at' => $readAt,
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Converte timestamp do Firebase (Unix seconds) para datetime string.
     */
    private function parseTimestamp(mixed $timestamp): ?string
    {
        if (is_numeric($timestamp)) {
            $ts = (int) $timestamp;
            if ($ts > 1e12) {
                $ts = (int) ($ts / 1000);
            }
            return date('Y-m-d H:i:s', $ts);
        }

        if (is_string($timestamp)) {
            $parsed = strtotime($timestamp);
            return $parsed ? date('Y-m-d H:i:s', $parsed) : null;
        }

        return null;
    }

    /**
     * Retorna dados brutos do Firebase (para debug/preview).
     */
    public function preview(string $path = '/'): ?array
    {
        $url = "{$this->rtdbUrl}{$path}.json";
        $response = Http::timeout(10)->get($url);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Retorna dados live do dashboard direto do Firebase.
     */
    public function getLiveDashboard(): ?array
    {
        $url = "{$this->rtdbUrl}/dashboard/readings/live.json";
        $response = Http::timeout(10)->get($url);

        return $response->successful() ? $response->json() : null;
    }
}
