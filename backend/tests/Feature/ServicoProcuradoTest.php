<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicoProcuradoTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wanted_services(): void
    {
        $this->getJson('/api/me/procurados')->assertUnauthorized();
        $this->postJson('/api/me/procurados', ['titulo' => 'x'])->assertUnauthorized();
    }

    public function test_user_adds_lists_and_removes_wanted_services_and_me_returns_them(): void
    {
        $eu = User::factory()->create();

        $id = $this->actingAs($eu)->postJson('/api/me/procurados', [
            'codigo' => 'edicao-video',
            'titulo' => 'Edição de Vídeo',
            'descricao' => 'Cortes e legendas.',
        ])->assertCreated()->assertJsonPath('data.codigo', 'edicao-video')->json('data.id');

        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => 'Aulas de inglês'])->assertCreated();

        $this->actingAs($eu)->getJson('/api/me/procurados')->assertOk()->assertJsonCount(2, 'data');
        $this->actingAs($eu)->getJson('/api/me')->assertOk()
            ->assertJsonCount(2, 'data.servicos_procurados')
            ->assertJsonPath('data.servicos_procurados.0.titulo', 'Edição de Vídeo');

        $this->actingAs($eu)->deleteJson("/api/me/procurados/{$id}")->assertOk();
        $this->assertDatabaseMissing('servicos_procurados', ['id' => $id]);
    }

    public function test_validation_duplicates_limit_and_ownership(): void
    {
        $eu = User::factory()->create();
        $outro = User::factory()->create();

        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => ''])->assertUnprocessable();
        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => str_repeat('a', 51)])->assertUnprocessable();
        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => 'X', 'usuario_id' => $outro->id])->assertUnprocessable();

        foreach (['A', 'B', 'C', 'D', 'E'] as $titulo) {
            $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => $titulo])->assertCreated();
        }
        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => 'A'])->assertUnprocessable(); // repetido
        $this->actingAs($eu)->postJson('/api/me/procurados', ['titulo' => 'F'])->assertUnprocessable(); // passou de 5

        $idDoOutro = $this->actingAs($outro)->postJson('/api/me/procurados', ['titulo' => 'A'])->assertCreated()->json('data.id');
        $this->actingAs($eu)->deleteJson("/api/me/procurados/{$idDoOutro}")->assertForbidden();
        $this->actingAs($eu)->deleteJson('/api/me/procurados/abc')->assertNotFound();
    }
}
