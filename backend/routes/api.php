<?php

use App\Http\Controllers\ServicoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'swappify-api',
]));

Route::apiResource('servicos', ServicoController::class);
