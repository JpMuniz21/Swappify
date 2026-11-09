<?php

use App\Http\Controllers\ServicoController;
use App\Models\Categoria;
use App\Http\Controllers\PostagemController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'swappify-api',
]));

// A leitura do catálogo é pública; escritas usam sessão/CSRF em account.php.
// Lista pública de categorias: o frontend usa para cadastrar serviços com o categoria_id certo.
Route::get('/categorias', fn () => response()->json([
    'data' => Categoria::query()->orderBy('id')->get(['id', 'nome', 'descricao']),
]));

Route::apiResource('servicos', ServicoController::class)->only(['index', 'show']);
Route::apiResource('postagens', PostagemController::class)
    ->parameters(['postagens' => 'postagem'])
    ->only(['index', 'show']);
