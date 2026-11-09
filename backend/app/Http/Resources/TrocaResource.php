<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrocaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $meuId = $request->user()->id;
        $souUsuario1 = $this->usuario_1_id === $meuId;
        $outro = $souUsuario1 ? $this->usuario2 : $this->usuario1;
        $meuServico = $souUsuario1 ? $this->servico1 : $this->servico2;
        $servicoDoOutro = $souUsuario1 ? $this->servico2 : $this->servico1;

        return [
            'id' => $this->id,
            'status' => $this->status,
            'data_match' => $this->data_match,
            'outro' => [
                'id' => $outro->id,
                'name' => $outro->name,
                'profession' => $outro->profession,
            ],
            'meu_servico' => ['id' => $meuServico->id, 'titulo' => $meuServico->titulo],
            'servico_do_outro' => ['id' => $servicoDoOutro->id, 'titulo' => $servicoDoOutro->titulo],
        ];
    }
}
