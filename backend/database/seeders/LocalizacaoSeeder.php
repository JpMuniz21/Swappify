<?php

namespace Database\Seeders;

use App\Models\Localizacao;
use Illuminate\Database\Seeder;

class LocalizacaoSeeder extends Seeder
{
    public function run(): void
    {
        Localizacao::query()->firstOrCreate([
            'cidade' => 'Fortaleza',
            'estado' => 'Ceará',
            'bairro' => 'Centro',
        ], [
            'cep' => '60000000',
        ]);
    }
}
