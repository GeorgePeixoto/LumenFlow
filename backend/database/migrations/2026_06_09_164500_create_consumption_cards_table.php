<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumption_cards', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('ID do device/setor no Firebase');
            $table->decimal('accumulated_kwh', 24, 8)->default(0.00000000)->comment('Consumo acumulado persistido (kWh)');
            $table->decimal('accumulated_cost', 24, 8)->default(0.00000000)->comment('Custo acumulado persistido (R$)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumption_cards');
    }
};
