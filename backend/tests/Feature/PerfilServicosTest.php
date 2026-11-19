<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Servico;
use App\Models\User;
use Database\Seeders\CategoriaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerfilServicosTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_are_public_and_seeded_for_the_frontend_catalog(): void
    {
        $this->seed(CategoriaSeeder::class);
        $this->seed(CategoriaSeeder::class); // rodar de novo não duplica

        $this->getJson('/api/categorias')->assertOk()
            ->assertJsonCount(7, 'data')
            ->assertJsonFragment(['nome' => 'Outros'])
            ->assertJsonStructure(['data' => [['id', 'nome', 'descricao']]]);
    }

    public function test_me_returns_only_my_services_with_category(): void
    {
        $eu = User::factory()->create();
        $outro = User::factory()->create();
        $categoria = Categoria::factory()->create(['nome' => 'Tecnologia']);
        Servico::factory()->create(['usuario_id' => $eu->id, 'categoria_id' => $categoria->id, 'titulo' => 'Criação de Sites']);
        Servico::factory()->create(['usuario_id' => $outro->id, 'titulo' => 'De outra pessoa']);

        $this->actingAs($eu)->getJson('/api/me')->assertOk()
            ->assertJsonCount(1, 'data.servicos')
            ->assertJsonPath('data.servicos.0.titulo', 'Criação de Sites')
            ->assertJsonPath('data.servicos.0.categoria.nome', 'Tecnologia');
    }
}
