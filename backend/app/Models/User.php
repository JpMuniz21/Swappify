<?php

namespace App\Models; // Namespace que permite importar este model como App\Models\User.

use Database\Factories\UserFactory; // Gera usuários fictícios nos testes.
use Illuminate\Database\Eloquent\Attributes\Fillable; // Define os campos que podem receber dados em massa.
use Illuminate\Database\Eloquent\Attributes\Hidden; // Impede expor campos sensíveis no JSON.
use Illuminate\Database\Eloquent\Factories\HasFactory; // Habilita User::factory().
use Illuminate\Foundation\Auth\User as Authenticatable; // Acrescenta os recursos necessários à autenticação.
use Illuminate\Notifications\Notifiable; // Mantém suporte às notificações do Laravel.

// BANCO: o Eloquent usa a tabela users na conexão DB_* do backend/.env.
// FUTUROS CAMPOS: criar uma nova migration e revisar validação, Fillable e resposta da API.
#[Fillable(['name', 'email', 'password'])] // Não permite alterar id ou permissões a partir do formulário.
#[Hidden(['password', 'remember_token'])] // Nunca retorna senha/hash e token de lembrança ao frontend.
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable; // Reutiliza as funcionalidades de testes e notificações.

    /** @return array<string, string> */
    protected function casts(): array // Define conversões ao ler/escrever atributos.
    {
        return [
            'email_verified_at' => 'datetime', // Converte a data em objeto de data/hora.
            'password' => 'hashed', // Armazena hash da senha, nunca a senha em texto.
        ];
    }
}
