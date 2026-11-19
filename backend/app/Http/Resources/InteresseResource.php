<?php

namespace App\Http\Resources;

use App\Models\Troca;
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
            // Match ativo que depende deste favorito. Remover o favorito apaga esse match
            // e as mensagens (cascata), então o frontend usa este campo para avisar antes.
            // A listagem já traz match_id pela subconsulta do controller; nos outros casos, consulta aqui.
            'match_id' => array_key_exists('match_id', $this->resource->getAttributes())
                ? $this->resource->getAttribute('match_id')
                : Troca::query()
                    ->where('status', 'ativo')
                    ->where(fn ($query) => $query
                        ->where('interesse_1_id', $this->id)
                        ->orWhere('interesse_2_id', $this->id))
                    ->value('id'),
            'created_at' => $this->created_at,
        ];
    }
}
