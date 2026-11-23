<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgendamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'match_id' => ['required', 'integer', 'exists:matches,id'],
            'inicio' => ['required', 'date', 'after:now'],
            'observacao' => ['nullable', 'string', 'max:500'],
            'status' => ['prohibited'],
            'criado_por_id' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'inicio.after' => 'Escolha uma data e hora no futuro.',
        ];
    }
}
