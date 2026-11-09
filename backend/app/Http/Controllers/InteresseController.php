<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInteresseRequest;
use App\Http\Resources\InteresseResource;
use App\Models\Interesse;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class InteresseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return InteresseResource::collection(
            $request->user()->interesses()
                ->with('servico.usuario')
                ->where('status', 'ativo')
                ->orderByDesc('data_criacao')
                ->paginate(15)
        );
    }

    public function store(StoreInteresseRequest $request): JsonResponse
    {
        $servico = Servico::findOrFail($request->validated('servico_id'));
        if ($servico->usuario_id === $request->user()->id) {
            throw ValidationException::withMessages([
                'servico_id' => ['Você não pode favoritar o próprio serviço.'],
            ]);
        }

        $interesse = $request->user()->interesses()->create([
            'servico_id' => $servico->id,
            'status' => 'ativo',
            'data_criacao' => now(),
        ]);

        return response()->json([
            'message' => 'Serviço adicionado aos favoritos.',
            'data' => new InteresseResource($interesse->load('servico.usuario')),
        ], 201);
    }

    public function destroy(Request $request, Interesse $interesse): JsonResponse
    {
        abort_unless($interesse->usuario_id === $request->user()->id, 403);
        $interesse->delete();

        return response()->json(['message' => 'Serviço removido dos favoritos.']);
    }
}
