<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$history = App\Models\ConsumptionHistory::orderBy('id', 'desc')->take(10)->get();
foreach ($history as $h) {
    echo "ID: {$h->id} | Sector: {$h->sector_label} | Power: {$h->power_w}W | Energy: {$h->energy_kwh}kWh | Created: {$h->recorded_at}\n";
}
