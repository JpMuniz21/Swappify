<?php

namespace App\Http\Controllers;

use App\Http\Resources\PerfilPublicoResource;
use App\Models\User;

// Perfil de outra pessoa (só leitura), aberto a partir do feed, match, favoritos e chat.
class PerfilPublicoController extends Controller
{
    // GET /api/usuarios/{usuario}
    public function show(User $usuario): PerfilPublicoResource
    {
        return new PerfilPublicoResource(
            $usuario->load(['localizacao', 'servicos.categoria', 'servicosProcurados', 'portfolio'])
        );
    }
}
