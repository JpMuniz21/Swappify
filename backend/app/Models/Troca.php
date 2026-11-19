<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// O model se chama Troca para não conflitar com a palavra reservada match do PHP.
class Troca extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'usuario_1_id',
        'usuario_2_id',
        'servico_1_id',
        'servico_2_id',
        'interesse_1_id',
        'interesse_2_id',
        'status',
        'data_match',
    ];

    protected function casts(): array
    {
        return ['data_match' => 'datetime'];
    }

    public function usuario1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_1_id');
    }

    public function usuario2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_2_id');
    }

    public function servico1(): BelongsTo
    {
        return $this->belongsTo(Servico::class, 'servico_1_id');
    }

    public function servico2(): BelongsTo
    {
        return $this->belongsTo(Servico::class, 'servico_2_id');
    }

    public function mensagens(): HasMany
    {
        return $this->hasMany(Mensagem::class, 'match_id');
    }
}
