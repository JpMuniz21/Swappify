<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Registrado em bootstrap/app.php SEM o grupo "web": abrir uma página não cria sessão.
// O fallback é sempre avaliado por último, depois de todas as rotas da API.
Route::get('/', SpaController::class);
// Aceita todos os métodos para que rotas inexistentes continuem dando 404 (e não 405);
// o SpaController só devolve a página para GET fora de /api.
Route::any('{caminho}', SpaController::class)->where('caminho', '.*')->fallback();
