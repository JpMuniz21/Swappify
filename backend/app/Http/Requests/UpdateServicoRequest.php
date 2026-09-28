<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'max:50'],
            'descricao' => ['sometimes', 'required', 'string', 'max:150'],
            'tipo' => ['sometimes', 'required', 'string', 'max:150'],
            'status' => ['sometimes', 'required', 'string', 'max:30'],
            'usuario_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'categoria_id' => ['sometimes', 'required', 'integer', 'exists:categorias,id'],
        ];
    }
}
