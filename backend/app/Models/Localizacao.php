<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Localizacao extends Model
{
    use HasFactory;

    protected $table = 'localizacoes';

    protected $fillable = ['cidade', 'estado', 'bairro', 'cep'];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'location_id');
    }
}
