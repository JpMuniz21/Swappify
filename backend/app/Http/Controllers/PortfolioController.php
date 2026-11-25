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

    private const REGRAS_IMAGEM = ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'];

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
            'imagem' => ['required', ...self::REGRAS_IMAGEM],
            'usuario_id' => ['prohibited'],
        ]);

        if ($usuario->portfolio()->count() >= self::LIMITE) {
            throw ValidationException::withMessages([
                'imagem' => ['Seu portfólio pode ter no máximo '.self::LIMITE.' itens.'],
            ]);
        }

        $item = $usuario->portfolio()->create([
            'titulo' => $request->string('titulo')->trim()->toString(),
            'imagem_url' => $this->salvarImagem($request),
        ]);

        return response()->json([
            'message' => 'Item adicionado ao portfólio.',
            'data' => $item->only(self::CAMPOS),
        ], 201);
    }

    // PATCH /api/me/portfolio/{item}  { titulo, imagem? }
    // Com imagem nova o front envia multipart como POST + _method=PATCH (o PHP não lê arquivos em PATCH).
    public function update(Request $request, PortfolioItem $item): JsonResponse
    {
        abort_unless($item->usuario_id === $request->user()->id, 403);
        $request->validate([
            'titulo' => ['required', 'string', 'max:80'],
            'imagem' => ['nullable', ...self::REGRAS_IMAGEM],
        ]);

        $imagemAnterior = null;
        $item->titulo = $request->string('titulo')->trim()->toString();
        if ($request->hasFile('imagem')) {
            $imagemAnterior = $item->imagem_url;
            $item->imagem_url = $this->salvarImagem($request);
        }
        $item->save();

        // só apaga a antiga depois de salvar a nova no banco
        if ($imagemAnterior) {
            $this->apagarImagem($imagemAnterior);
        }

        return response()->json([
            'message' => 'Item atualizado.',
            'data' => $item->only(self::CAMPOS),
        ]);
    }

    // DELETE /api/me/portfolio/{item}
    public function destroy(Request $request, PortfolioItem $item): JsonResponse
    {
        abort_unless($item->usuario_id === $request->user()->id, 403);

        $this->apagarImagem($item->imagem_url);
        $item->delete();

        return response()->json(['message' => 'Item removido do portfólio.']);
    }

    private function salvarImagem(Request $request): string
    {
        return asset('storage/'.$request->file('imagem')->store('portfolio', 'public'));
    }

    // apaga o arquivo só se ele foi enviado por aqui
    private function apagarImagem(string $url): void
    {
        if (str_contains($url, '/storage/portfolio/')) {
            Storage::disk('public')->delete('portfolio/'.basename($url));
        }
    }
}
