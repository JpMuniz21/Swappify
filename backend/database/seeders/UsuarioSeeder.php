<?php

namespace Database\Seeders;

use App\Models\Localizacao;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $localizacao = Localizacao::query()->firstOrFail();

        User::query()->firstOrCreate(['email' => 'teste@swappify.local'], [
            'name' => 'Usuário de Teste',
            'password' => Hash::make('password'),
            'profession' => 'Estudante',
            'bio' => 'Conta criada para demonstrar o Swappify.',
            'registered_at' => now()->toDateString(),
            'location_id' => $localizacao->id,
        ]);
    }
}
