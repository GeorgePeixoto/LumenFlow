<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumption_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('sector_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('power_w', 10, 2)->comment('Potência instantânea (W)');
            $table->decimal('energy_kwh', 12, 4)->comment('Energia acumulada (kWh)');
            $table->decimal('corrente', 8, 3)->nullable()->comment('Corrente (A)');
            $table->decimal('tensao', 8, 2)->nullable()->comment('Tensão (V)');
            $table->decimal('fator_pf', 4, 3)->nullable()->comment('Fator de potência');
            $table->timestamp('read_at')->comment('Momento da leitura do sensor');
            $table->timestamps();

            $table->index(['sector_id', 'read_at']);
            $table->index(['device_id', 'read_at']);
            $table->index('read_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumption_readings');
    }
};
