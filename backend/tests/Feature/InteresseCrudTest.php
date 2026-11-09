<?php

namespace Tests\Feature;

use App\Models\Interesse;
use App\Models\Servico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InteresseCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_favorite_list_and_remove_another_users_service(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $servico = Servico::factory()->create(['usuario_id' => $owner->id]);

        $id = $this->actingAs($viewer)->postJson('/api/interesses', ['servico_id' => $servico->id])
            ->assertCreated()
            ->assertJsonPath('data.servico.id', $servico->id)
            ->assertJsonPath('data.servico.usuario.id', $owner->id)
            ->assertJsonPath('data.status', 'ativo')
            ->json('data.id');

        $this->assertDatabaseHas('interesses', [
            'id' => $id,
            'usuario_id' => $viewer->id,
            'servico_id' => $servico->id,
            'status' => 'ativo',
        ]);
        $this->getJson('/api/interesses')->assertOk()->assertJsonPath('data.0.id', $id);

        $this->deleteJson("/api/interesses/{$id}")->assertOk();
        $this->assertDatabaseMissing('interesses', ['id' => $id]);
    }

    public function test_guests_cannot_access_favorites(): void
    {
        $interesse = Interesse::factory()->create();
        $this->getJson('/api/interesses')->assertUnauthorized();
        $this->postJson('/api/interesses', ['servico_id' => $interesse->servico_id])->assertUnauthorized();
        $this->deleteJson("/api/interesses/{$interesse->id}")->assertUnauthorized();
    }

    public function test_user_cannot_favorite_own_service_or_duplicate_a_favorite(): void
    {
        $owner = User::factory()->create();
        $ownService = Servico::factory()->create(['usuario_id' => $owner->id]);
        $this->actingAs($owner)->postJson('/api/interesses', ['servico_id' => $ownService->id])
            ->assertUnprocessable()->assertJsonValidationErrors('servico_id');

        $otherService = Servico::factory()->create();
        $this->postJson('/api/interesses', ['servico_id' => $otherService->id])->assertCreated();
        $this->postJson('/api/interesses', ['servico_id' => $otherService->id])
            ->assertUnprocessable()->assertJsonValidationErrors('servico_id');
    }

    public function test_user_cannot_remove_another_users_favorite_or_set_server_fields(): void
    {
        $interesse = Interesse::factory()->create();
        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/interesses/{$interesse->id}")->assertForbidden();

        $viewer = User::factory()->create();
        $servico = Servico::factory()->create();
        $this->actingAs($viewer)->postJson('/api/interesses', [
            'servico_id' => $servico->id,
            'usuario_id' => $interesse->usuario_id,
            'status' => 'aceito',
            'data_criacao' => '2000-01-01 00:00:00',
        ])->assertUnprocessable()->assertJsonValidationErrors(['usuario_id', 'status', 'data_criacao']);
    }
}
