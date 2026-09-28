<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:50'],
            'descricao' => ['required', 'string', 'max:150'],
            'tipo' => ['required', 'string', 'max:150'],
            'status' => ['required', 'string', 'max:30'],
            'usuario_id' => ['required', 'integer', 'exists:users,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
        ];
    }
}
