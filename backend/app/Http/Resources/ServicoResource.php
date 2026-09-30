<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Seleciona explicitamente os dados públicos: não expõe e-mail, bairro ou CEP.
class ServicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'tipo' => $this->tipo,
            'status' => $this->status,
            'usuario_id' => $this->usuario_id,
            'categoria_id' => $this->categoria_id,
            'usuario' => [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
                'profession' => $this->usuario->profession,
                'bio' => $this->usuario->bio,
                'localizacao' => $this->usuario->localizacao ? [
                    'cidade' => $this->usuario->localizacao->cidade,
                    'estado' => $this->usuario->localizacao->estado,
                ] : null,
            ],
            'categoria' => $this->categoria,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
