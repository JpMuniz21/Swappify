<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgendamentoRequest;
use App\Http\Requests\UpdateAgendamentoRequest;
use App\Http\Resources\AgendamentoResource;
use App\Models\Agendamento;
use App\Models\Troca;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AgendamentoController extends Controller
{
    private const RELACOES = ['troca.usuario1', 'troca.usuario2', 'troca.servico1', 'troca.servico2'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $meuId = $request->user()->id;

        return AgendamentoResource::collection(
            Agendamento::with(self::RELACOES)
                ->whereHas('troca', fn ($q) => $q
                    ->where('usuario_1_id', $meuId)
                    ->orWhere('usuario_2_id', $meuId))
                ->orderBy('inicio')
                ->get()
        );
    }

    public function store(StoreAgendamentoRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $troca = Troca::findOrFail($dados['match_id']);

        $this->exigirParticipante($request->user(), $troca);
        abort_unless($troca->status === 'ativo', 422, 'Esta troca não está ativa.');

        $agendamento = Agendamento::create([
            'match_id' => $troca->id,
            'criado_por_id' => $request->user()->id,
            'inicio' => $this->paraFusoDoApp($dados['inicio']),
            'observacao' => $dados['observacao'] ?? null,
            'status' => 'pendente',
        ]);

        return response()->json([
            'message' => 'Agendamento criado com sucesso.',
            'data' => new AgendamentoResource($agendamento->load(self::RELACOES)),
        ], 201);
    }

    public function update(UpdateAgendamentoRequest $request, Agendamento $agendamento): JsonResponse
    {
        $usuario = $request->user();
        $agendamento->load(self::RELACOES);

        $this->exigirParticipante($usuario, $agendamento->troca);
        abort_if(
            in_array($agendamento->status, ['concluida', 'cancelada'], true),
            422,
            'Este agendamento não pode mais ser alterado.'
        );

        $dados = $request->validated();

        if (array_key_exists('observacao', $dados)) {
            $agendamento->observacao = $dados['observacao'];
        }

        if (isset($dados['inicio'])) {
            // Remarcar: o novo horário volta a ser uma proposta da pessoa que remarcou.
            $agendamento->inicio = $this->paraFusoDoApp($dados['inicio']);
            $agendamento->status = 'pendente';
            $agendamento->criado_por_id = $usuario->id;
        } elseif (isset($dados['status'])) {
            $this->aplicarStatus($agendamento, $dados['status'], $usuario);
        }

        $agendamento->save();

        return response()->json([
            'message' => 'Agendamento atualizado com sucesso.',
            'data' => new AgendamentoResource($agendamento->fresh(self::RELACOES)),
        ]);
    }

    private function aplicarStatus(Agendamento $agendamento, string $novo, User $usuario): void
    {
        if ($novo === 'confirmada') {
            abort_unless($agendamento->status === 'pendente', 422, 'Só é possível confirmar um agendamento pendente.');
            abort_if(
                $agendamento->criado_por_id === $usuario->id,
                403,
                'Quem propôs o horário não pode confirmá-lo. Aguarde a outra pessoa.'
            );
        }

        if ($novo === 'concluida') {
            abort_unless($agendamento->status === 'confirmada', 422, 'Só é possível concluir um agendamento confirmado.');
        }

        $agendamento->status = $novo;
    }

    private function exigirParticipante(User $usuario, Troca $troca): void
    {
        abort_unless(
            in_array($usuario->id, [$troca->usuario_1_id, $troca->usuario_2_id], true),
            403,
            'Você não participa desta troca.'
        );
    }

    // O front envia o horário com fuso (ex.: -03:00). Convertemos antes de gravar,
    // senão o banco guardaria o horário local como se fosse do fuso do servidor.
    private function paraFusoDoApp(string $valor): Carbon
    {
        return Carbon::parse($valor)->setTimezone(config('app.timezone'));
    }
}
