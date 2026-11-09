<?php

namespace App\Http\Controllers;

use App\Models\ServicoProcurado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

// "O que eu procuro" do perfil. Sempre da própria pessoa logada.
class ServicoProcuradoController extends Controller
{
    public const LIMITE = 5;

    // GET /api/me/procurados
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->servicosProcurados()->orderBy('id')->get(['id', 'codigo', 'titulo', 'descricao']),
        ]);
    }

    // POST /api/me/procurados  { titulo, descricao?, codigo? }
    public function store(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $dados = $request->validate([
            'titulo' => ['required', 'string', 'max:50',
                Rule::unique('servicos_procurados', 'titulo')->where('usuario_id', $usuario->id)],
            'descricao' => ['nullable', 'string', 'max:150'],
            'codigo' => ['nullable', 'string', 'max:60'],
            'usuario_id' => ['prohibited'],
        ], [
            'titulo.unique' => 'Você já adicionou este serviço.',
        ]);

        if ($usuario->servicosProcurados()->count() >= self::LIMITE) {
            throw ValidationException::withMessages([
                'titulo' => ['Você pode procurar no máximo '.self::LIMITE.' serviços.'],
            ]);
        }

        $procurado = $usuario->servicosProcurados()->create($dados);

        return response()->json([
            'message' => 'Serviço adicionado ao que você procura.',
            'data' => $procurado->only(['id', 'codigo', 'titulo', 'descricao']),
        ], 201);
    }

    // DELETE /api/me/procurados/{procurado}
    public function destroy(Request $request, ServicoProcurado $procurado): JsonResponse
    {
        abort_unless($procurado->usuario_id === $request->user()->id, 403);
        $procurado->delete();

        return response()->json(['message' => 'Serviço removido do que você procura.']);
    }
}
