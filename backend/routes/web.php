<?php

use Illuminate\Support\Facades\Route;

// A rota "/" e as páginas do React ficam em routes/spa.php.

// Carrega o CRUD com a sessão e a proteção CSRF do grupo web.
require __DIR__.'/account.php';
