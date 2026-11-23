<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

// Portfólio do perfil. Sempre da própria pessoa logada.
class PortfolioController extends Controller
{
    public const LIMITE = 12;

    private const CAMPOS = ['id', 'titulo', 'imagem_url', 'created_at'];

    // GET /api/me/portfolio
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->portfolio()->get(self::CAMPOS),
        ]);
    }

    // POST /api/me/portfolio  (multipart: imagem, titulo)
    public function store(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $request->validate([
            'titulo' => ['required', 'string', 'max:80'],
            'imagem' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'usuario_id' => ['prohibited'],
        ]);

        if ($usuario->portfolio()->count() >= self::LIMITE) {
            throw ValidationException::withMessages([
                'imagem' => ['Seu portfólio pode ter no máximo '.self::LIMITE.' fotos.'],
            ]);
        }

        $caminho = $request->file('imagem')->store('portfolio', 'public');
        $item = $usuario->portfolio()->create([
            'titulo' => $request->string('titulo')->trim()->toString(),
            'imagem_url' => asset('storage/'.$caminho),
        ]);

        return response()->json([
            'message' => 'Foto adicionada ao portfólio.',
            'data' => $item->only(self::CAMPOS),
        ], 201);
    }

    // DELETE /api/me/portfolio/{item}
    public function destroy(Request $request, PortfolioItem $item): JsonResponse
    {
        abort_unless($item->usuario_id === $request->user()->id, 403);

        if (str_contains($item->imagem_url, '/storage/portfolio/')) {
            Storage::disk('public')->delete('portfolio/'.basename($item->imagem_url));
        }
        $item->delete();

        return response()->json(['message' => 'Foto removida do portfólio.']);
    }
}
