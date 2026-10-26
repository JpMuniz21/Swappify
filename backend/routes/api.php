<?php

use App\Http\Controllers\ServicoController;
use App\Http\Controllers\PostagemController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'swappify-api',
]));

// A leitura do catálogo é pública; escritas usam sessão/CSRF em account.php.
Route::apiResource('servicos', ServicoController::class)->only(['index', 'show']);
Route::apiResource('postagens', PostagemController::class)
    ->parameters(['postagens' => 'postagem'])
    ->only(['index', 'show']);
