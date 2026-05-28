<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['convencional', 'bandeira'])->default('convencional');
            $table->decimal('value_kwh', 8, 4)->comment('Valor por kWh em R$');
            $table->enum('flag_color', ['green', 'yellow', 'red_1', 'red_2'])->nullable()->comment('Cor da bandeira tarifária');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tariffs');
    }
};
