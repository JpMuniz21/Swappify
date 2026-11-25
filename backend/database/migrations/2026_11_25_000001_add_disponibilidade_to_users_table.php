<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Disponibilidade do perfil: { dias, horarios, atendimentos, distancia, mensagem }.
            // Nulo = ainda não preenchida (o front mostra o card vazio).
            $table->json('disponibilidade')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('disponibilidade');
        });
    }
};
