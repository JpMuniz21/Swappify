<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Perfil de outra pessoa, só leitura. Lista explícita de campos públicos:
// nunca expõe e-mail, bairro, CEP nem dados de login (mesma regra do catálogo).
class PerfilPublicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'profession' => $this->profession,
            'bio' => $this->bio,
            'avatar_url' => $this->avatar_url,
            'membro_desde' => $this->registered_at?->toDateString(),
            'localizacao' => $this->localizacao ? [
                'cidade' => $this->localizacao->cidade,
                'estado' => $this->localizacao->estado,
            ] : null,
            'disponibilidade' => $this->disponibilidade,
            'servicos' => $this->servicos->map(fn ($servico) => [
                'id' => $servico->id,
                'titulo' => $servico->titulo,
                'descricao' => $servico->descricao,
                'tipo' => $servico->tipo,
                'categoria' => $servico->categoria?->nome,
            ])->values(),
            'servicos_procurados' => $this->servicosProcurados->map(fn ($procurado) => [
                'id' => $procurado->id,
                'codigo' => $procurado->codigo,
                'titulo' => $procurado->titulo,
                'descricao' => $procurado->descricao,
            ])->values(),
            'portfolio' => $this->portfolio->map(fn ($item) => [
                'id' => $item->id,
                'titulo' => $item->titulo,
                'imagem_url' => $item->imagem_url,
            ])->values(),
        ];
    }
}
