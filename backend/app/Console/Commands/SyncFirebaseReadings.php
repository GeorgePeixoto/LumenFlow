<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AlertDetectionService;
use App\Services\FirebaseSyncService;
use Illuminate\Console\Command;

class SyncFirebaseReadings extends Command
{
    protected $signature = 'firebase:sync {--sector= : ID do setor específico} {--no-alerts : Pular detecção de alertas}';

    protected $description = 'Sincroniza leituras de sensores do Firebase RTDB e detecta alertas';

    public function handle(FirebaseSyncService $syncService, AlertDetectionService $alertService): int
    {
        $sectorId = $this->option('sector') ? (int) $this->option('sector') : null;
        $timestamp = now()->format('Y-m-d H:i:s');

        $this->info("[{$timestamp}] Iniciando sincronização com Firebase...");

        $result = $syncService->syncReadings($sectorId);

        if (isset($result['error'])) {
            $this->error("[{$timestamp}] Erro: {$result['error']}");
            return self::FAILURE;
        }

        $this->info("[{$timestamp}] {$result['message']} ({$result['synced']} registros)");

        // Detecção automática de alertas
        if (!$this->option('no-alerts') && $result['synced'] > 0) {
            $this->info("[{$timestamp}] Executando detecção de alertas...");

            $users = User::all();
            $totalAlerts = 0;

            foreach ($users as $user) {
                $alerts = $alertService->detectAll($user);
                $userTotal = array_sum($alerts);
                $totalAlerts += $userTotal;

                if ($userTotal > 0) {
                    $this->line("  User {$user->email}: {$userTotal} alertas gerados");
                }
            }

            $this->info("[{$timestamp}] Detecção concluída: {$totalAlerts} alertas gerados.");
        }

        return self::SUCCESS;
    }
}
