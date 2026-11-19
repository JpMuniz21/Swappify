<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInteresseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'servico_id' => [
                'required',
                'integer',
                'exists:servicos,id',
                Rule::unique('interesses', 'servico_id')
                    ->where(fn ($query) => $query->where('usuario_id', $this->user()->id)),
            ],
            'usuario_id' => ['prohibited'],
            'status' => ['prohibited'],
            'data_criacao' => ['prohibited'],
        ];
    }
}
