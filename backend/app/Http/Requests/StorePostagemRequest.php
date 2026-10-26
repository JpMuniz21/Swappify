<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostagemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:120'],
            'conteudo' => ['required', 'string', 'max:5000'],
            'url_anexo' => ['nullable', 'url', 'max:2048'],
            'usuario_id' => ['prohibited'],
            'data_publicacao' => ['prohibited'],
            'status' => ['prohibited'],
        ];
    }
}
