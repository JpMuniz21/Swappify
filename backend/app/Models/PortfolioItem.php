<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Foto de trabalho realizado, exibida no Portfólio do perfil.
class PortfolioItem extends Model
{
    protected $table = 'portfolio_itens';

    protected $fillable = [
        'titulo',
        'imagem_url',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
