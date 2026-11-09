<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Serviço que a pessoa procura ("O que eu procuro" no perfil).
class ServicoProcurado extends Model
{
    protected $table = 'servicos_procurados';

    protected $fillable = [
        'codigo',
        'titulo',
        'descricao',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
