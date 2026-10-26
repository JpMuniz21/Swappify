<?php

namespace App\Http\Requests;

use App\Models\Postagem;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePostagemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $postagem = $this->route('postagem');

        return $this->user() !== null
            && $postagem instanceof Postagem
            && $postagem->usuario_id === $this->user()->id
            && $postagem->status !== 'excluida';
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:120'],
            'conteudo' => ['sometimes', 'required', 'string', 'max:5000'],
            'url_anexo' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'usuario_id' => ['prohibited'],
            'data_publicacao' => ['prohibited'],
            'status' => ['prohibited'],
        ];
    }
}
