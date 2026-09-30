<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Compatível tanto com o users original quanto com bancos já criados pela dev.
        foreach (['profession' => 100, 'bio' => 240] as $column => $length) {
            if (! Schema::hasColumn('users', $column)) {
                Schema::table('users', fn (Blueprint $table) => $table->string($column, $length)->nullable());
            }
        }

        if (! Schema::hasColumn('users', 'registered_at')) {
            Schema::table('users', fn (Blueprint $table) => $table->date('registered_at')->nullable());
        }
        // Preserva a data de criação das contas antigas; usa hoje quando não existe data.
        DB::table('users')->whereNull('registered_at')->update([
            'registered_at' => DB::raw('COALESCE(DATE(created_at), CURRENT_DATE)'),
        ]);
        Schema::table('users', fn (Blueprint $table) => $table->date('registered_at')->nullable(false)->change());

        if (! Schema::hasColumn('users', 'location_id')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->foreignId('location_id')->nullable()->constrained('localizacoes')->restrictOnDelete();
            });
        } else {
            // Permite cadastro inicial sem localização, mantendo a chave estrangeira existente.
            Schema::table('users', fn (Blueprint $table) => $table->unsignedBigInteger('location_id')->nullable()->change());
        }
    }

    public function down(): void
    {
        // Estes campos agora pertencem a esta migration, inclusive em instalações antigas da dev.
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('location_id');
            $table->dropColumn(['profession', 'bio', 'registered_at']);
        });
    }
};
