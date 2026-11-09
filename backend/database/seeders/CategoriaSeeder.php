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
            ['nome' => 'Saúde e bem-estar', 'descricao' => 'Atividade física, cuidados e qualidade de vida.'],
            ['nome' => 'Serviços gerais', 'descricao' => 'Manutenção, reparos, montagem e limpeza.'],
            ['nome' => 'Pets', 'descricao' => 'Cuidados, passeios e adestramento de animais.'],
            ['nome' => 'Outros', 'descricao' => 'Serviços personalizados que não se encaixam nas demais.'],
        ] as $categoria) {
            Categoria::query()->firstOrCreate(['nome' => $categoria['nome']], $categoria);
        }
    }
}
