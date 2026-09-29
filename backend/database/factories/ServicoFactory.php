<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Servico> */
class ServicoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo' => fake()->words(3, true),
            'descricao' => fake()->sentence(10),
            'tipo' => fake()->randomElement(['Serviço', 'Habilidade', 'Mentoria']),
            'status' => 'disponivel',
            'usuario_id' => User::factory(),
            'categoria_id' => Categoria::factory(),
        ];
    }
}
