<?php

use App\Http\Controllers\AccountController; // Controller responsável pelo cadastro e pelo próprio perfil.
use Illuminate\Support\Facades\Route; // Registra os endereços HTTP.

// Este arquivo é incluído por web.php para ter cookies, sessão e proteção CSRF.
// FRONTEND: as URLs começam em http://localhost:8000/api; consultar docs/usuarios.md.
Route::prefix('api')->middleware('auth.session')->group(function (): void {
    Route::get('/csrf-token', [AccountController::class, 'csrfToken']); // Inicializa a sessão e fornece o token CSRF.
    Route::post('/register', [AccountController::class, 'store'])->middleware('throttle:5,1'); // Limita cadastro a 5 tentativas/minuto.
    Route::post('/login', [AccountController::class, 'login'])->middleware('throttle:5,1'); // Limita tentativas de senha.

    Route::middleware(['auth:web', 'throttle:60,1'])->group(function (): void { // Exige login e limita requisições.
        Route::get('/me', [AccountController::class, 'show']); // Consulta a própria conta.
        Route::patch('/me', [AccountController::class, 'update']); // Altera os campos enviados.
        Route::delete('/me', [AccountController::class, 'destroy']); // Exclui a conta confirmando a senha.
        Route::post('/logout', [AccountController::class, 'logout']); // Encerra a sessão atual.
    });
});
