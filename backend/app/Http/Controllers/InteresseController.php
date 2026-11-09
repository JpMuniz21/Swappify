<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInteresseRequest;
use App\Http\Resources\InteresseResource;
use App\Models\Interesse;
use App\Models\Servico;
use App\Models\Troca;
use Illuminate\Support\Facades\DB;
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

        [$interesse, $match] = DB::transaction(function () use ($request, $servico): array {
            $interesse = $request->user()->interesses()->create([
                'servico_id' => $servico->id,
                'status' => 'ativo',
                'data_criacao' => now(),
            ]);

            return [$interesse, $this->criarMatchSeReciproco($interesse, $servico)];
        });

        return response()->json([
            'message' => 'Serviço adicionado aos favoritos.',
            'data' => new InteresseResource($interesse->load('servico.usuario')),
            'meta' => [
                'match_criado' => $match?->wasRecentlyCreated ?? false,
                'match_id' => $match?->id,
            ],
        ], 201);
    }

    public function destroy(Request $request, Interesse $interesse): JsonResponse
    {
        abort_unless($interesse->usuario_id === $request->user()->id, 403);
        $interesse->delete();

        return response()->json(['message' => 'Serviço removido dos favoritos.']);
    }

    // O segundo interesse recíproco cria uma troca entre os dois serviços automaticamente.
    private function criarMatchSeReciproco(Interesse $novoInteresse, Servico $servicoDesejado): ?Troca
    {
        $usuarioAtualId = $novoInteresse->usuario_id;
        $outroUsuarioId = $servicoDesejado->usuario_id;
        $interesseReciproco = Interesse::query()
            ->with('servico')
            ->where('usuario_id', $outroUsuarioId)
            ->where('status', 'ativo')
            ->whereHas('servico', fn ($query) => $query->where('usuario_id', $usuarioAtualId))
            ->latest('data_criacao')
            ->first();

        if ($interesseReciproco === null) {
            return null;
        }

        [$interesse1Id, $interesse2Id] = collect([$novoInteresse->id, $interesseReciproco->id])->sort()->values()->all();

        return Troca::firstOrCreate(
            ['interesse_1_id' => $interesse1Id, 'interesse_2_id' => $interesse2Id],
            [
                'usuario_1_id' => $usuarioAtualId,
                'usuario_2_id' => $outroUsuarioId,
                'servico_1_id' => $interesseReciproco->servico_id,
                'servico_2_id' => $servicoDesejado->id,
                'status' => 'ativo',
                'data_match' => now(),
            ]
        );
    }
}
