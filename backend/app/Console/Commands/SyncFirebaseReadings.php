<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AlertDetectionService;
use App\Services\FirebaseSyncService;
use Illuminate\Console\Command;

class SyncFirebaseReadings extends Command
{
    protected $signature = 'firebase:sync {--sector= : ID do setor específico} {--no-alerts : Pular detecção de alertas}';

    protected $description = 'Sincroniza leituras de sensores do Firebase RTDB para o MySQL e detecta alertas';

    public function handle(FirebaseSyncService $syncService, AlertDetectionService $alertService): int
    {
        $sectorId = $this->option('sector') ? (int) $this->option('sector') : null;

        $this->info('Iniciando sincronização com Firebase...');

        $result = $syncService->syncReadings($sectorId);

        if (isset($result['error'])) {
            $this->error("Erro: {$result['error']}");
            return self::FAILURE;
        }

        $this->info($result['message']);

        // Detecção automática de alertas
        if (!$this->option('no-alerts') && $result['synced'] > 0) {
            $this->info('Executando detecção de alertas...');

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

            $this->info("Detecção concluída: {$totalAlerts} alertas gerados.");
        }

        return self::SUCCESS;
    }
}
