<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_1_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('usuario_2_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('servico_1_id')->constrained('servicos')->cascadeOnDelete();
            $table->foreignId('servico_2_id')->constrained('servicos')->cascadeOnDelete();
            $table->foreignId('interesse_1_id')->constrained('interesses')->cascadeOnDelete();
            $table->foreignId('interesse_2_id')->constrained('interesses')->cascadeOnDelete();
            $table->string('status', 20)->default('ativo');
            $table->timestamp('data_match')->useCurrent();
            $table->timestamps();

            $table->unique(['interesse_1_id', 'interesse_2_id']);
            $table->index(['usuario_1_id', 'status']);
            $table->index(['usuario_2_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
