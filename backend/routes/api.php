<?php

use App\Http\Controllers\ServicoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'swappify-api',
]));

// A leitura do catálogo é pública; escritas usam sessão/CSRF em account.php.
Route::apiResource('servicos', ServicoController::class)->only(['index', 'show']);
