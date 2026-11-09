<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interesse extends Model
{
    use HasFactory;

    protected $table = 'interesses';

    protected $fillable = [
        'servico_id',
        'status',
        'data_criacao',
    ];

    protected function casts(): array
    {
        return [
            'data_criacao' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function servico(): BelongsTo
    {
        return $this->belongsTo(Servico::class, 'servico_id');
    }
}
