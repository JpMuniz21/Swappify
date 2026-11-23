<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgendamentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $meuId = $request->user()->id;
        $troca = $this->troca;
        $souUsuario1 = $troca->usuario_1_id === $meuId;
        $outro = $souUsuario1 ? $troca->usuario2 : $troca->usuario1;
        $meuServico = $souUsuario1 ? $troca->servico1 : $troca->servico2;
        $servicoDoOutro = $souUsuario1 ? $troca->servico2 : $troca->servico1;

        return [
            'id' => $this->id,
            'match_id' => $this->match_id,
            'inicio' => $this->inicio?->toIso8601String(),
            'status' => $this->status,
            'observacao' => $this->observacao,
            'criado_por_mim' => $this->criado_por_id === $meuId,
            'parceiro' => ['id' => $outro->id, 'nome' => $outro->name],
            'ofereco' => $meuServico->titulo,
            'recebo' => $servicoDoOutro->titulo,
        ];
    }
}
