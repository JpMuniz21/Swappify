<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicoCrudTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return [
            'titulo' => 'Aulas de violão',
            'descricao' => 'Aulas para pessoas iniciantes.',
            'tipo' => 'Serviço',
            'status' => 'disponivel',
            'categoria_id' => Categoria::factory()->create()->id,
        ];
    }

    public function test_owner_can_create_read_update_and_delete_service(): void
    {
        $owner = User::factory()->create();
        $payload = $this->payload();
        $id = $this->actingAs($owner)->postJson('/api/servicos', $payload)
            ->assertCreated()->assertJsonPath('data.usuario.id', $owner->id)
            ->json('data.id');
        $this->assertDatabaseHas('servicos', $payload + ['usuario_id' => $owner->id]);
        $this->getJson('/api/servicos')->assertOk()->assertJsonPath('data.0.id', $id);
        $this->getJson("/api/servicos/{$id}")->assertOk()->assertJsonPath('data.id', $id);
        $this->putJson("/api/servicos/{$id}", ['titulo' => 'Aulas avançadas'])
            ->assertOk()->assertJsonPath('data.titulo', 'Aulas avançadas');
        $this->patchJson("/api/servicos/{$id}", ['status' => 'indisponivel'])
            ->assertOk()->assertJsonPath('data.status', 'indisponivel');
        $this->deleteJson("/api/servicos/{$id}")->assertOk();
        $this->assertDatabaseMissing('servicos', ['id' => $id]);
    }

    public function test_guests_cannot_write_services(): void
    {
        $service = Servico::factory()->create();
        $this->postJson('/api/servicos', $this->payload())->assertUnauthorized();
        $this->patchJson("/api/servicos/{$service->id}", ['titulo' => 'Intruso'])->assertUnauthorized();
        $this->deleteJson("/api/servicos/{$service->id}")->assertUnauthorized();
        $this->assertDatabaseHas('servicos', ['id' => $service->id, 'titulo' => $service->titulo]);
    }

    public function test_user_cannot_change_or_delete_another_users_service(): void
    {
        $service = Servico::factory()->create();
        $this->actingAs(User::factory()->create())
            ->patchJson("/api/servicos/{$service->id}", ['titulo' => 'Intruso'])->assertForbidden();
        $this->deleteJson("/api/servicos/{$service->id}")->assertForbidden();
        $this->assertDatabaseHas('servicos', ['id' => $service->id, 'titulo' => $service->titulo]);
    }

    public function test_owner_cannot_be_supplied_or_transferred_by_client(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($owner)->postJson('/api/servicos', $this->payload() + ['usuario_id' => $other->id])
            ->assertUnprocessable()->assertJsonValidationErrors('usuario_id');
        $service = Servico::factory()->create(['usuario_id' => $owner->id]);
        $this->patchJson("/api/servicos/{$service->id}", ['usuario_id' => $other->id])
            ->assertUnprocessable()->assertJsonValidationErrors('usuario_id');
        $this->assertDatabaseHas('servicos', ['id' => $service->id, 'usuario_id' => $owner->id]);
    }

    public function test_public_catalog_does_not_expose_private_profile_fields(): void
    {
        $service = Servico::factory()->create();
        foreach (['/api/servicos' => 'data.0', "/api/servicos/{$service->id}" => 'data'] as $url => $prefix) {
            $this->getJson($url)->assertOk()
                ->assertJsonPath("{$prefix}.usuario.id", $service->usuario_id)
                ->assertJsonMissingPath("{$prefix}.usuario.email")
                ->assertJsonMissingPath("{$prefix}.usuario.password")
                ->assertJsonMissingPath("{$prefix}.usuario.remember_token")
                ->assertJsonMissingPath("{$prefix}.usuario.localizacao.bairro")
                ->assertJsonMissingPath("{$prefix}.usuario.localizacao.cep");
        }
    }

    public function test_service_validates_required_fields_and_category(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/servicos', [
            'titulo' => '', 'descricao' => 'Descrição', 'tipo' => 'Serviço',
            'status' => 'disponivel', 'categoria_id' => 999,
        ])->assertUnprocessable()->assertJsonValidationErrors(['titulo', 'categoria_id']);
    }

    public function test_new_registration_can_create_service_without_location_and_delete_own_account(): void
    {
        // Integra os dois CRUDs sem depender das factories para preencher o cadastro.
        $id = $this->postJson('/api/register', [
            'name' => 'Ana', 'email' => 'ana@example.com',
            'password' => 'Senha12345', 'password_confirmation' => 'Senha12345',
            'registered_at' => '1900-01-01',
        ])->assertCreated()->assertJsonPath('data.registered_at', now()->startOfDay()->toJSON())->json('data.id');
        $this->assertDatabaseHas('users', ['id' => $id, 'location_id' => null]);
        $otherService = Servico::factory()->create();
        $serviceId = $this->postJson('/api/servicos', $this->payload())->assertCreated()
            ->assertJsonPath('data.usuario.localizacao', null)->json('data.id');
        $this->deleteJson('/api/me', ['current_password' => 'Senha12345'])->assertNoContent();
        // Mantém a regra da dev: a exclusão definitiva da conta apaga seus serviços.
        $this->assertDatabaseMissing('servicos', ['id' => $serviceId]);
        $this->assertDatabaseHas('servicos', ['id' => $otherService->id]);
    }

    public function test_service_writes_require_csrf_even_when_authenticated(): void
    {
        $this->app->instance('env', 'local'); // Ativa a checagem real de CSRF neste teste.
        $this->actingAs(User::factory()->create());
        $payload = $this->payload();
        $this->postJson('/api/servicos', $payload)->assertStatus(419);
        $token = $this->getJson('/api/csrf-token')->assertOk()->json('csrf_token');
        $this->withHeader('X-CSRF-TOKEN', $token)->postJson('/api/servicos', $payload)->assertCreated();
    }

    public function test_cors_accepts_put_with_session_credentials(): void
    {
        $this->withHeaders([
            'Origin' => config('cors.allowed_origins')[0],
            'Access-Control-Request-Method' => 'PUT',
            'Access-Control-Request-Headers' => 'Content-Type,X-CSRF-TOKEN',
        ])->options('/api/servicos/1')->assertNoContent()
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
