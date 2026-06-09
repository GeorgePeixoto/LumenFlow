<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sector_consumption_averages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('sector_name')->index()->comment('Identificador do setor no Firebase');
            $table->decimal('average_kwh', 12, 4)->default(0)->comment('Valor médio de consumo (kWh)');
            $table->boolean('is_manual_override')->default(false)->comment('Se foi definido manualmente');
            $table->timestamp('calculated_at')->nullable()->comment('Quando foi calculado automaticamente');
            $table->timestamps();

            $table->unique(['sector_name', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sector_consumption_averages');
    }
};
