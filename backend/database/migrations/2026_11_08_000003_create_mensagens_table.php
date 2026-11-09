<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensagens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('remetente_id')->constrained('users')->cascadeOnDelete();
            $table->text('conteudo');
            $table->boolean('lida')->default(false);
            $table->timestamp('data_envio')->useCurrent();
            $table->timestamps();

            $table->index(['match_id', 'data_envio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensagens');
    }
};
