<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Agendamento extends Model
{
    use HasFactory;

    protected $table = 'agendamentos';

    protected $fillable = [
        'match_id',
        'criado_por_id',
        'inicio',
        'status',
        'observacao',
    ];

    protected function casts(): array
    {
        return ['inicio' => 'datetime'];
    }

    public function troca(): BelongsTo
    {
        return $this->belongsTo(Troca::class, 'match_id');
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_id');
    }
}
