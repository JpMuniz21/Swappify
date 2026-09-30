<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Mantém os campos de perfil usados pelo CRUD de serviços.
// A data de cadastro é atribuída pelo servidor, não pelo formulário.
#[Fillable(['name', 'email', 'password', 'profession', 'bio', 'location_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected static function booted(): void
    {
        // Também cobre cadastros feitos por outros pontos da aplicação.
        static::creating(function (User $user): void {
            $user->registered_at ??= now()->toDateString();
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Converte datas na leitura.
            'password' => 'hashed', // Nunca armazena a senha em texto.
            'registered_at' => 'date', // Preserva o campo introduzido na dev.
        ];
    }

    public function localizacao(): BelongsTo
    {
        return $this->belongsTo(Localizacao::class, 'location_id');
    }

    public function servicos(): HasMany
    {
        return $this->hasMany(Servico::class, 'usuario_id');
    }
}
