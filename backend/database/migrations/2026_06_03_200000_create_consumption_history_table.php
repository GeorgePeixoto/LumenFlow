<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumption_history', function (Blueprint $table) {
            $table->id();
            $table->string('sector_name')->index()->comment('Nome do setor no Firebase (ex: Setor_A)');
            $table->string('sector_label')->nullable()->comment('Label legível (ex: Refrigeração)');
            $table->string('firebase_device_id')->comment('ID do device no Firebase');
            $table->decimal('power_w', 10, 2)->comment('Potência instantânea (W)');
            $table->decimal('energy_kwh', 12, 4)->comment('Energia acumulada (kWh)');
            $table->decimal('cost_estimate', 10, 2)->default(0)->comment('Custo estimado (R$)');
            $table->decimal('tariff_used', 8, 4)->default(0.85)->comment('Tarifa usada no cálculo (R$/kWh)');
            $table->timestamp('recorded_at')->comment('Momento da leitura do sensor');
            $table->timestamps();

            $table->index(['sector_name', 'recorded_at']);
            $table->index('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumption_history');
    }
};
