<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensagem extends Model
{
    use HasFactory;

    protected $table = 'mensagens';

    protected $fillable = ['match_id', 'remetente_id', 'conteudo', 'lida', 'data_envio'];

    protected function casts(): array
    {
        return ['lida' => 'boolean', 'data_envio' => 'datetime'];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(Troca::class, 'match_id');
    }

    public function remetente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remetente_id');
    }
}
