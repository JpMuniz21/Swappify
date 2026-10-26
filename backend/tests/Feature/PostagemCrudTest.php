<?php

namespace Tests\Feature;

use App\Models\Postagem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostagemCrudTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return [
            'titulo' => 'Primeira publicação',
            'conteudo' => 'Este é o conteúdo da minha publicação no Swappify.',
            'url_anexo' => 'https://example.com/anexo.png',
        ];
    }

    public function test_owner_can_create_read_update_and_soft_delete_a_postagem(): void
    {
        $owner = User::factory()->create();
        $id = $this->actingAs($owner)->postJson('/api/postagens', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.usuario.id', $owner->id)
            ->assertJsonPath('data.status', 'ativa')
            ->json('data.id');

        $this->assertDatabaseHas('postagens', [
            'id' => $id,
            'usuario_id' => $owner->id,
            'titulo' => 'Primeira publicação',
            'status' => 'ativa',
        ]);
        $this->getJson('/api/postagens')->assertOk()->assertJsonPath('data.0.id', $id);
        $this->getJson("/api/postagens/{$id}")->assertOk()->assertJsonPath('data.id', $id);

        $this->patchJson("/api/postagens/{$id}", ['titulo' => 'Publicação atualizada'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Publicação atualizada')
            ->assertJsonPath('data.status', 'editada');

        $this->deleteJson("/api/postagens/{$id}")->assertOk();
        $this->assertDatabaseHas('postagens', ['id' => $id, 'status' => 'excluida']);
        $this->getJson('/api/postagens')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/postagens/{$id}")->assertNotFound();
    }

    public function test_guests_cannot_write_postagens(): void
    {
        $postagem = Postagem::factory()->create();
        $this->postJson('/api/postagens', $this->payload())->assertUnauthorized();
        $this->patchJson("/api/postagens/{$postagem->id}", ['titulo' => 'Intruso'])->assertUnauthorized();
        $this->deleteJson("/api/postagens/{$postagem->id}")->assertUnauthorized();
    }

    public function test_user_cannot_change_or_delete_another_users_postagem(): void
    {
        $postagem = Postagem::factory()->create();
        $this->actingAs(User::factory()->create())
            ->patchJson("/api/postagens/{$postagem->id}", ['titulo' => 'Intruso'])->assertForbidden();
        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/postagens/{$postagem->id}")->assertForbidden();
        $this->assertDatabaseHas('postagens', ['id' => $postagem->id, 'status' => 'ativa']);
    }

    public function test_client_cannot_choose_owner_date_or_status(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($owner)->postJson('/api/postagens', $this->payload() + [
            'usuario_id' => $other->id,
            'data_publicacao' => '2000-01-01 00:00:00',
            'status' => 'excluida',
        ])->assertUnprocessable()->assertJsonValidationErrors(['usuario_id', 'data_publicacao', 'status']);
    }

    public function test_postagem_validates_its_required_fields_and_attachment_url(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/postagens', [
            'titulo' => '', 'conteudo' => '', 'url_anexo' => 'arquivo-local',
        ])->assertUnprocessable()->assertJsonValidationErrors(['titulo', 'conteudo', 'url_anexo']);
    }
}
