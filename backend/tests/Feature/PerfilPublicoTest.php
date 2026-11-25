<?php

namespace Tests\Feature;

use App\Models\Servico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerfilPublicoTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_see_profiles(): void
    {
        $outro = User::factory()->create();

        $this->getJson("/api/usuarios/{$outro->id}")->assertUnauthorized();
    }

    public function test_logged_user_sees_public_profile_with_services_portfolio_and_availability(): void
    {
        $eu = User::factory()->create();
        $outro = User::factory()->create([
            'disponibilidade' => ['dias' => 'Sábado', 'horarios' => 'Manhã', 'atendimentos' => 'Online'],
        ]);
        $servico = Servico::factory()->for($outro, 'usuario')->create(['titulo' => 'Aulas de violão']);
        $outro->servicosProcurados()->create(['titulo' => 'Inglês', 'codigo' => 'idiomas']);
        $outro->portfolio()->create(['titulo' => 'Show na praça', 'imagem_url' => 'http://localhost/storage/portfolio/x.png']);

        $this->actingAs($eu)->getJson("/api/usuarios/{$outro->id}")->assertOk()
            ->assertJsonPath('data.id', $outro->id)
            ->assertJsonPath('data.name', $outro->name)
            ->assertJsonPath('data.localizacao.cidade', $outro->localizacao->cidade)
            ->assertJsonPath('data.disponibilidade.dias', 'Sábado')
            ->assertJsonPath('data.servicos.0.titulo', 'Aulas de violão')
            ->assertJsonPath('data.servicos.0.categoria', $servico->categoria->nome)
            ->assertJsonPath('data.servicos_procurados.0.titulo', 'Inglês')
            ->assertJsonPath('data.portfolio.0.titulo', 'Show na praça');
    }

    public function test_public_profile_does_not_expose_private_fields(): void
    {
        $eu = User::factory()->create();
        $outro = User::factory()->create();

        $this->actingAs($eu)->getJson("/api/usuarios/{$outro->id}")->assertOk()
            ->assertJsonMissingPath('data.email')
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token')
            ->assertJsonMissingPath('data.email_verified_at')
            ->assertJsonMissingPath('data.location_id')
            ->assertJsonMissingPath('data.localizacao.bairro')
            ->assertJsonMissingPath('data.localizacao.cep');
    }

    public function test_unknown_or_invalid_id_returns_404(): void
    {
        $eu = User::factory()->create();

        $this->actingAs($eu)->getJson('/api/usuarios/999999')->assertNotFound();
        $this->actingAs($eu)->getJson('/api/usuarios/abc')->assertNotFound();
    }
}
