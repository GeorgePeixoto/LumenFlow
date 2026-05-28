<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sector_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type')->nullable()->comment('Ex: motor, iluminacao, ar_condicionado');
            $table->decimal('power_watts', 10, 2)->nullable()->comment('Potência nominal (W)');
            $table->boolean('active')->default(true);
            $table->enum('status', ['online', 'offline', 'maintenance'])->default('online');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
