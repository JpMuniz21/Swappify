<?php

namespace Database\Factories;

use App\Models\Postagem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Postagem> */
class PostagemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'titulo' => fake()->sentence(4),
            'conteudo' => fake()->paragraph(),
            'url_anexo' => fake()->optional()->url(),
            'data_publicacao' => now(),
            'status' => 'ativa',
        ];
    }
}
