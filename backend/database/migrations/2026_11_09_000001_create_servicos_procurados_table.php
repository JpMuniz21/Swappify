<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// "O que eu procuro" do perfil: serviços que a pessoa deseja receber em troca.
// Diferente de "servicos" (o que a pessoa oferece), não aparece no catálogo do Match.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicos_procurados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('codigo', 60)->nullable(); // item do catálogo do front, ou "personalizado"
            $table->string('titulo', 50);
            $table->string('descricao', 150)->nullable();
            $table->timestamps();
            $table->unique(['usuario_id', 'titulo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicos_procurados');
    }
};
