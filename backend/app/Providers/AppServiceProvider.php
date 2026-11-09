<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Os parâmetros de rota com model binding só aceitam números.
        // Assim /api/postagens/abc responde 404 em vez de erro 500 no Postgres
        // (que não compara texto com coluna bigint).
        foreach (['servico', 'postagem', 'interesse', 'match', 'procurado'] as $parametro) {
            Route::pattern($parametro, '[0-9]+');
        }
    }
}
