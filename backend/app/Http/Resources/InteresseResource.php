<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InteresseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'servico_id' => $this->servico_id,
            'status' => $this->status,
            'data_criacao' => $this->data_criacao,
            'servico' => [
                'id' => $this->servico->id,
                'titulo' => $this->servico->titulo,
                'descricao' => $this->servico->descricao,
                'tipo' => $this->servico->tipo,
                'status' => $this->servico->status,
                'usuario' => [
                    'id' => $this->servico->usuario->id,
                    'name' => $this->servico->usuario->name,
                    'profession' => $this->servico->usuario->profession,
                ],
            ],
            'created_at' => $this->created_at,
        ];
    }
}
