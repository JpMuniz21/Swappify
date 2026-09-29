<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Localizacao;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicoCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_service_can_be_created_and_listed(): void
    {
        [$usuario, $categoria] = $this->dadosRelacionados();

        $payload = [
            'titulo' => 'Aulas de violão',
            'descricao' => 'Aulas para pessoas iniciantes.',
            'tipo' => 'Serviço',
            'status' => 'disponivel',
            'usuario_id' => $usuario->id,
            'categoria_id' => $categoria->id,
        ];

        $this->postJson('/api/servicos', $payload)
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Aulas de violão')
            ->assertJsonPath('data.usuario.id', $usuario->id)
            ->assertJsonPath('data.categoria.id', $categoria->id);

        $this->assertDatabaseHas('servicos', $payload);

        $this->getJson('/api/servicos')
            ->assertOk()
            ->assertJsonPath('data.0.titulo', 'Aulas de violão');
    }

    public function test_a_service_can_be_viewed_updated_and_deleted(): void
    {
        [$usuario, $categoria] = $this->dadosRelacionados();
        $servico = Servico::factory()->create([
            'usuario_id' => $usuario->id,
            'categoria_id' => $categoria->id,
            'status' => 'disponivel',
        ]);

        $this->getJson("/api/servicos/{$servico->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $servico->id);

        $this->putJson("/api/servicos/{$servico->id}", [
            'titulo' => 'Aulas de violão avançadas',
            'status' => 'indisponivel',
        ])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Aulas de violão avançadas')
            ->assertJsonPath('data.status', 'indisponivel');

        $this->deleteJson("/api/servicos/{$servico->id}")
            ->assertOk();

        $this->assertDatabaseMissing('servicos', ['id' => $servico->id]);
    }

    public function test_a_service_requires_valid_related_records(): void
    {
        $this->postJson('/api/servicos', [
            'titulo' => '',
            'descricao' => 'Descrição',
            'tipo' => 'Serviço',
            'status' => 'disponivel',
            'usuario_id' => 999,
            'categoria_id' => 999,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'usuario_id', 'categoria_id']);
    }

    /** @return array{User, Categoria} */
    private function dadosRelacionados(): array
    {
        $localizacao = Localizacao::factory()->create();
        $usuario = User::factory()->create(['location_id' => $localizacao->id]);
        $categoria = Categoria::factory()->create();

        return [$usuario, $categoria];
    }
}
