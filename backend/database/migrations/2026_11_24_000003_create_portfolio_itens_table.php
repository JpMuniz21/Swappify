<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Portfólio do perfil: fotos de trabalhos realizados pela pessoa.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo', 80);
            $table->string('imagem_url', 2048); // endereço público da imagem (disco "public")
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_itens');
    }
};
