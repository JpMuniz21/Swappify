<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nome' => 'Educação', 'descricao' => 'Aulas, reforço e mentoria.'],
            ['nome' => 'Tecnologia', 'descricao' => 'Serviços e suporte em tecnologia.'],
            ['nome' => 'Criatividade', 'descricao' => 'Artes, design e produção criativa.'],
        ] as $categoria) {
            Categoria::query()->firstOrCreate(['nome' => $categoria['nome']], $categoria);
        }
    }
}
