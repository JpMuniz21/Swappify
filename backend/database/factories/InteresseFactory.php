<?php

namespace Database\Factories;

use App\Models\Interesse;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Interesse> */
class InteresseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'servico_id' => Servico::factory(),
            'status' => 'ativo',
            'data_criacao' => now(),
        ];
    }
}
