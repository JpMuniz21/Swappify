<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgendamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'inicio' => ['sometimes', 'date', 'after:now'],
            'observacao' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', Rule::in(['confirmada', 'concluida', 'cancelada'])],
            'match_id' => ['prohibited'],
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
