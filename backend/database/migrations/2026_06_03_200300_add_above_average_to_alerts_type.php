<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * SQLite não suporta ALTER COLUMN para enum. Recriamos a tabela alerts
     * com o tipo 'above_average' adicionado ao CHECK constraint.
     *
     * Estratégia:
     * 1. Salvar todos os dados existentes
     * 2. Dropar a tabela
     * 3. Recriar com o novo enum
     * 4. Restaurar os dados
     */
    public function up(): void
    {
        // 1. Salvar dados existentes
        $existingAlerts = DB::table('alerts')->get()->toArray();

        // 2. Desabilitar foreign key checks temporariamente (SQLite)
        DB::statement('PRAGMA foreign_keys = OFF');

        // 3. Dropar tabela antiga
        Schema::dropIfExists('alerts');

        // 4. Recriar com enum atualizado
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sector_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('device_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', [
                'off_hours',
                'anomaly',
                'overload',
                'night_waste',
                'threshold',
                'manual',
                'above_average',   // ← NOVO: consumo acima da média configurada
            ])->index();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('title');
            $table->text('message')->nullable();
            $table->enum('status', ['open', 'acknowledged', 'resolved'])->default('open')->index();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'type', 'status']);
        });

        // 5. Restaurar dados existentes
        foreach ($existingAlerts as $alert) {
            DB::table('alerts')->insert((array) $alert);
        }

        // 6. Reabilitar foreign key checks
        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        $existingAlerts = DB::table('alerts')->get()->toArray();

        DB::statement('PRAGMA foreign_keys = OFF');
        Schema::dropIfExists('alerts');

        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sector_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('device_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['off_hours', 'anomaly', 'overload', 'night_waste', 'threshold', 'manual'])->index();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('title');
            $table->text('message')->nullable();
            $table->enum('status', ['open', 'acknowledged', 'resolved'])->default('open')->index();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'type', 'status']);
        });

        // Restaurar apenas alertas com tipos válidos originais
        $validTypes = ['off_hours', 'anomaly', 'overload', 'night_waste', 'threshold', 'manual'];
        foreach ($existingAlerts as $alert) {
            $alertArr = (array) $alert;
            if (in_array($alertArr['type'], $validTypes)) {
                DB::table('alerts')->insert($alertArr);
            }
        }

        DB::statement('PRAGMA foreign_keys = ON');
    }
};
