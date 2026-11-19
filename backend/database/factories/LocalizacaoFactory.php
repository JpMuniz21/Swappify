<?php

namespace Database\Factories;

use App\Models\Localizacao;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Localizacao> */
class LocalizacaoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cidade' => fake()->city(),
            'estado' => fake()->state(),
            'bairro' => fake()->streetName(),
            'cep' => fake()->numerify('########'),
        ];
    }
}
