<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Alinha a escala de energia_kwh e average_kwh dividindo por 1000 os valores históricos
     * e configurados que estão na escala antiga.
     */
    public function up(): void
    {
        // Dividir valores históricos de consumo por 1000 caso sejam superiores a 1.0
        DB::table('consumption_history')
            ->where('energy_kwh', '>', 1.0)
            ->update([
                'energy_kwh' => DB::raw('energy_kwh * 0.001')
            ]);

        // Dividir limites configurados manualmente/automaticamente por 1000 caso sejam superiores a 1.0
        DB::table('sector_consumption_averages')
            ->where('average_kwh', '>', 1.0)
            ->update([
                'average_kwh' => DB::raw('average_kwh * 0.001')
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter valores históricos multiplicando por 1000
        DB::table('consumption_history')
            ->where('energy_kwh', '<', 1.0)
            ->update([
                'energy_kwh' => DB::raw('energy_kwh * 1000')
            ]);

        // Reverter limites multiplicando por 1000
        DB::table('sector_consumption_averages')
            ->where('average_kwh', '<', 1.0)
            ->update([
                'average_kwh' => DB::raw('average_kwh * 1000')
            ]);
    }
};
