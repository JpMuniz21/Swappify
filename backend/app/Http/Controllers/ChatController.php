<?php

namespace App\Http\Controllers;

use App\Models\Mensagem;
use App\Models\Troca;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // GET /api/conversas: retorna somente matches ativos da pessoa logada.
    public function conversas(Request $request): JsonResponse
    {
        $meuId = $request->user()->id;
        $matches = Troca::with(['usuario1', 'usuario2'])
            ->where('status', 'ativo')
            ->where(fn ($query) => $query->where('usuario_1_id', $meuId)->orWhere('usuario_2_id', $meuId))
            ->orderByDesc('data_match')
            ->get();

        return response()->json($matches->map(function (Troca $match) use ($meuId): array {
            $outro = $match->usuario_1_id === $meuId ? $match->usuario2 : $match->usuario1;

            return [
                'id_match' => $match->id,
                'outro' => [
                    'id' => $outro->id,
                    'nome' => $outro->name,
                    'avatar_url' => null,
                ],
            ];
        })->values());
    }

    // GET /api/conversas/{idMatch}/mensagens
    public function mensagens(Request $request, string $idMatch): JsonResponse
    {
        $match = $this->matchDoUsuario($request, $idMatch);
        if ($match === null) {
            return response()->json(['message' => 'Conversa não encontrada.'], 404);
        }

        Mensagem::where('match_id', $match->id)
            ->where('remetente_id', '!=', $request->user()->id)
            ->where('lida', false)
            ->update(['lida' => true]);

        return response()->json(
            Mensagem::where('match_id', $match->id)
                ->orderBy('data_envio')
                ->orderBy('id')
                ->get()
                ->map(fn (Mensagem $mensagem) => $this->mensagemParaApi($mensagem, $request->user()->id))
                ->values()
        );
    }

    // POST /api/conversas/{idMatch}/mensagens
    public function enviar(Request $request, string $idMatch): JsonResponse
    {
        $match = $this->matchDoUsuario($request, $idMatch);
        if ($match === null) {
            return response()->json(['message' => 'Conversa não encontrada.'], 404);
        }

        $dados = $request->validate(['conteudo' => ['required', 'string', 'max:2000']]);
        $mensagem = $match->mensagens()->create([
            'remetente_id' => $request->user()->id,
            'conteudo' => $dados['conteudo'],
            'lida' => false,
            'data_envio' => now(),
        ]);

        return response()->json($this->mensagemParaApi($mensagem, $request->user()->id), 201);
    }

    private function matchDoUsuario(Request $request, string $idMatch): ?Troca
    {
        return Troca::whereKey($idMatch)
            ->where('status', 'ativo')
            ->where(fn ($query) => $query
                ->where('usuario_1_id', $request->user()->id)
                ->orWhere('usuario_2_id', $request->user()->id))
            ->first();
    }

    private function mensagemParaApi(Mensagem $mensagem, int $meuId): array
    {
        return [
            'id_mensagem' => $mensagem->id,
            'id_match' => $mensagem->match_id,
            'id_remetente' => $mensagem->remetente_id,
            'conteudo' => $mensagem->conteudo,
            'data_envio' => $mensagem->data_envio,
            'lida' => $mensagem->lida,
            'minha' => $mensagem->remetente_id === $meuId,
        ];
    }
}
