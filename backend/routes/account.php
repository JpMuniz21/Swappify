<?php

use App\Http\Controllers\AccountController; // Controller responsável pelo cadastro e pelo próprio perfil.
use App\Http\Controllers\ServicoController;
use App\Http\Controllers\PostagemController;
use App\Http\Controllers\InteresseController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\ServicoProcuradoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController; // Registra os endereços HTTP.

// Este arquivo é incluído por web.php para ter cookies, sessão e proteção CSRF.
// FRONTEND: as URLs começam em http://localhost:8000/api; consultar docs/usuarios.md.
Route::prefix('api')->middleware('auth.session')->group(function (): void {
    Route::get('/csrf-token', [AccountController::class, 'csrfToken']); // Inicializa a sessão e fornece o token CSRF.
    Route::post('/register', [AccountController::class, 'store'])->middleware('throttle:5,1'); // Limita cadastro a 5 tentativas/minuto.
    Route::post('/login', [AccountController::class, 'login'])->middleware('throttle:5,1'); // Limita tentativas de senha.

    Route::middleware(['auth:web', 'throttle:60,1'])->group(function (): void { // Exige login e limita requisições.
        // Escritas dos serviços compartilham autenticação, sessão e CSRF do usuário.
        Route::apiResource('servicos', ServicoController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('postagens', PostagemController::class)
            ->parameters(['postagens' => 'postagem'])
            ->only(['store', 'update', 'destroy']);
        Route::apiResource('interesses', InteresseController::class)
            ->parameters(['interesses' => 'interesse'])
            ->only(['index', 'store', 'destroy']);
        Route::apiResource('matches', MatchController::class)
            ->parameters(['matches' => 'match'])
            ->only(['index', 'show']);
        Route::post('/matches/{match}/cancelar', [MatchController::class, 'cancelar']); // Desfaz o match (status "cancelado").
        // "O que eu procuro" do perfil
        Route::get('/me/procurados', [ServicoProcuradoController::class, 'index']);
        Route::post('/me/procurados', [ServicoProcuradoController::class, 'store']);
        Route::delete('/me/procurados/{procurado}', [ServicoProcuradoController::class, 'destroy']);
        Route::get('/me', [AccountController::class, 'show']); // Consulta a própria conta.
        Route::patch('/me', [AccountController::class, 'update']); // Altera os campos enviados.
        Route::delete('/me', [AccountController::class, 'destroy']); // Exclui a conta confirmando a senha.
        Route::get('/conversas', [ChatController::class, 'conversas']);
        // IDs são números; outro valor responde 404 (no Postgres, comparar texto com bigint daria erro 500).
        Route::get('/conversas/{idMatch}/mensagens', [ChatController::class, 'mensagens'])
            ->whereNumber('idMatch');
        Route::post('/conversas/{idMatch}/mensagens', [ChatController::class, 'enviar'])
            ->whereNumber('idMatch');
        Route::post('/logout', [AccountController::class, 'logout']); // Encerra a sessão atual.
    });
});
