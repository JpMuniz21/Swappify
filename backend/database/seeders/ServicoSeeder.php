<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServicoSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = User::query()->firstOrFail();
        $categoria = Categoria::query()->where('nome', 'Educação')->firstOrFail();

        Servico::query()->firstOrCreate(['titulo' => 'Aulas de violão'], [
            'descricao' => 'Aulas introdutórias de violão para iniciantes.',
            'tipo' => 'Serviço',
            'status' => 'disponivel',
            'usuario_id' => $usuario->id,
            'categoria_id' => $categoria->id,
        ]);
    }
}
