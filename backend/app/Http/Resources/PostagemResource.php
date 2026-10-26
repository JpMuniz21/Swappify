<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostagemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'titulo' => $this->titulo,
            'conteudo' => $this->conteudo,
            'url_anexo' => $this->url_anexo,
            'data_publicacao' => $this->data_publicacao,
            'status' => $this->status,
            'usuario' => [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
                'profession' => $this->usuario->profession,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
