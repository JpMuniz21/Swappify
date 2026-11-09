<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postagens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo', 120);
            $table->text('conteudo');
            $table->string('url_anexo', 2048)->nullable();
            $table->timestamp('data_publicacao')->useCurrent();
            $table->string('status', 10)->default('ativa');
            $table->timestamps();

            $table->index(['status', 'data_publicacao']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postagens');
    }
};
