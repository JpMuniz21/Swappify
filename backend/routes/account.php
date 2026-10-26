<?php

use App\Http\Controllers\AccountController; // Controller responsável pelo cadastro e pelo próprio perfil.
use App\Http\Controllers\ServicoController;
use App\Http\Controllers\PostagemController;
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
        Route::get('/me', [AccountController::class, 'show']); // Consulta a própria conta.
        Route::patch('/me', [AccountController::class, 'update']); // Altera os campos enviados.
        Route::delete('/me', [AccountController::class, 'destroy']); // Exclui a conta confirmando a senha.
        Route::get('/conversas', [ChatController::class, 'conversas']);
        Route::get('/conversas/{idMatch}/mensagens', [ChatController::class, 'mensagens'])
            ->where('idMatch', '[A-Za-z0-9\-]+');
        Route::post('/conversas/{idMatch}/mensagens', [ChatController::class, 'enviar'])
                ->where('idMatch', '[A-Za-z0-9\-]+');
        Route::post('/logout', [AccountController::class, 'logout']); // Encerra a sessão atual.
    });
});
