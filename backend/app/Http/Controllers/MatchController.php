<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrocaResource;
use App\Models\Troca;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatchController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return TrocaResource::collection(
            Troca::with(['usuario1', 'usuario2', 'servico1', 'servico2'])
                ->where('status', 'ativo')
                ->where(fn ($query) => $query
                    ->where('usuario_1_id', $request->user()->id)
                    ->orWhere('usuario_2_id', $request->user()->id))
                ->orderByDesc('data_match')
                ->paginate(15)
        );
    }

    public function show(Request $request, Troca $match): TrocaResource
    {
        abort_unless(
            $match->status === 'ativo'
            && in_array($request->user()->id, [$match->usuario_1_id, $match->usuario_2_id], true),
            403
        );

        return new TrocaResource($match->load(['usuario1', 'usuario2', 'servico1', 'servico2']));
    }

    // POST /api/matches/{id}/cancelar: qualquer participante pode desfazer o match.
    // O registro e as mensagens são mantidos; o match só deixa de aparecer na lista e no chat.
    public function cancelar(Request $request, Troca $match): JsonResponse
    {
        abort_unless(
            in_array($request->user()->id, [$match->usuario_1_id, $match->usuario_2_id], true),
            403
        );

        if ($match->status !== 'ativo') {
            return response()->json(['message' => 'Este match já foi cancelado.'], 409);
        }

        $match->update(['status' => 'cancelado']);

        return response()->json(['message' => 'Match cancelado.']);
    }
}
