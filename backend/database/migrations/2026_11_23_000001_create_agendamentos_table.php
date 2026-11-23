<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            // Quem propôs o horário atual: a outra pessoa é quem confirma.
            $table->foreignId('criado_por_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('inicio');
            $table->string('status', 20)->default('pendente'); // pendente | confirmada | concluida | cancelada
            $table->string('observacao', 500)->nullable();
            $table->timestamps();

            $table->index(['match_id', 'inicio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agendamentos');
    }
};
