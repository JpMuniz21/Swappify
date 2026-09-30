<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'service' => 'Swappify API',
    'health' => '/api/health',
]));

// Carrega o CRUD com a sessão e a proteção CSRF do grupo web.
require __DIR__.'/account.php';
