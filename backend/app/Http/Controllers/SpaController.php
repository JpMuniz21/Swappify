<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Em produção (Dockerfile da raiz) o build do React fica em public/index.html.
// Qualquer endereço que não seja da API (/feed, /perfil, /chat...) recebe essa página,
// e o React Router decide o que mostrar. Em desenvolvimento não há index.html.
class SpaController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $pagina = public_path('index.html');

        // Rotas inexistentes da API continuam respondendo 404 em JSON.
        if ($request->is('api/*') || ! $request->isMethod('GET')) {
            abort(404, 'Rota não encontrada.');
        }

        if (! is_file($pagina)) {
            if ($request->path() === '/') {
                return response()->json(['service' => 'Swappify API', 'health' => '/api/health']);
            }
            abort(404);
        }

        return response()->file($pagina, ['Cache-Control' => 'no-cache']);
    }
}
