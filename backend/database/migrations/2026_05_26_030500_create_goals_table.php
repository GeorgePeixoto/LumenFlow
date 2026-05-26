<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('scope', ['global', 'sector', 'device'])->default('global');
            $table->foreignId('sector_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('device_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->enum('unit', ['kwh', 'reais', 'percent'])->default('kwh');
            $table->decimal('value', 12, 2)->comment('Valor alvo da meta');
            $table->decimal('current_value', 12, 2)->default(0)->comment('Valor atual acumulado');
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['active', 'completed', 'failed', 'cancelled'])->default('active');
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
