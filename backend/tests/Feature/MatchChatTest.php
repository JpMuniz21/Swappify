<?php

namespace Tests\Feature;

use App\Models\Servico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchChatTest extends TestCase
{
    use RefreshDatabase;

    private function criarMatchReciproco(): array
    {
        $ana = User::factory()->create(['name' => 'Ana']);
        $bia = User::factory()->create(['name' => 'Bia']);
        $servicoDaAna = Servico::factory()->create(['usuario_id' => $ana->id, 'titulo' => 'Aulas de violão']);
        $servicoDaBia = Servico::factory()->create(['usuario_id' => $bia->id, 'titulo' => 'Design de logo']);

        $this->actingAs($ana)->postJson('/api/interesses', ['servico_id' => $servicoDaBia->id])
            ->assertCreated()->assertJsonPath('meta.match_criado', false);
        $matchId = $this->actingAs($bia)->postJson('/api/interesses', ['servico_id' => $servicoDaAna->id])
            ->assertCreated()->assertJsonPath('meta.match_criado', true)->json('meta.match_id');

        return [$ana, $bia, $servicoDaAna, $servicoDaBia, $matchId];
    }

    public function test_reciprocal_interests_create_one_match_with_both_services(): void
    {
        [$ana, $bia, $servicoDaAna, $servicoDaBia, $matchId] = $this->criarMatchReciproco();

        $this->assertDatabaseHas('matches', [
            'id' => $matchId,
            'usuario_1_id' => $bia->id,
            'usuario_2_id' => $ana->id,
            'servico_1_id' => $servicoDaBia->id,
            'servico_2_id' => $servicoDaAna->id,
            'status' => 'ativo',
        ]);
        $this->actingAs($ana)->getJson('/api/matches')->assertOk()
            ->assertJsonPath('data.0.id', $matchId)
            ->assertJsonPath('data.0.outro.id', $bia->id)
            ->assertJsonPath('data.0.meu_servico.id', $servicoDaAna->id);
        $this->actingAs($bia)->getJson("/api/matches/{$matchId}")->assertOk()
            ->assertJsonPath('data.outro.id', $ana->id)
            ->assertJsonPath('data.meu_servico.id', $servicoDaBia->id);
    }

    public function test_only_match_participants_can_view_or_message_a_conversation(): void
    {
        [$ana, $bia, , , $matchId] = $this->criarMatchReciproco();
        $outraPessoa = User::factory()->create();

        $this->actingAs($ana)->postJson("/api/conversas/{$matchId}/mensagens", ['conteudo' => 'Vamos trocar?'])
            ->assertCreated()
            ->assertJsonPath('id_match', $matchId)
            ->assertJsonPath('minha', true);
        $this->actingAs($bia)->getJson('/api/conversas')->assertOk()
            ->assertJsonPath('0.id_match', $matchId)
            ->assertJsonPath('0.outro.id', $ana->id);
        $this->actingAs($bia)->getJson("/api/conversas/{$matchId}/mensagens")->assertOk()
            ->assertJsonPath('0.conteudo', 'Vamos trocar?')
            ->assertJsonPath('0.minha', false);
        $this->assertDatabaseHas('mensagens', ['match_id' => $matchId, 'lida' => true]);

        $this->actingAs($outraPessoa)->getJson("/api/matches/{$matchId}")->assertForbidden();
        $this->actingAs($outraPessoa)->getJson("/api/conversas/{$matchId}/mensagens")->assertNotFound();
        $this->actingAs($outraPessoa)->postJson("/api/conversas/{$matchId}/mensagens", ['conteudo' => 'Intrusão'])
            ->assertNotFound();
    }

    public function test_participant_can_cancel_match_and_it_leaves_lists_and_chat(): void
    {
        [$ana, $bia, , , $matchId] = $this->criarMatchReciproco();
        $outraPessoa = User::factory()->create();
        $this->actingAs($ana)->postJson("/api/conversas/{$matchId}/mensagens", ['conteudo' => 'Oi'])->assertCreated();

        $this->actingAs($outraPessoa)->postJson("/api/matches/{$matchId}/cancelar")->assertForbidden();
        $this->actingAs($bia)->postJson("/api/matches/{$matchId}/cancelar")->assertOk();
        $this->actingAs($ana)->postJson("/api/matches/{$matchId}/cancelar")->assertStatus(409);

        $this->assertDatabaseHas('matches', ['id' => $matchId, 'status' => 'cancelado']);
        $this->assertDatabaseHas('mensagens', ['match_id' => $matchId, 'conteudo' => 'Oi']); // histórico preservado
        $this->actingAs($ana)->getJson('/api/matches')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($ana)->getJson('/api/conversas')->assertOk()->assertJsonCount(0);
        $this->actingAs($ana)->getJson("/api/conversas/{$matchId}/mensagens")->assertNotFound();
        $this->actingAs($ana)->getJson('/api/interesses')->assertOk()->assertJsonPath('data.0.match_id', null);
    }

    public function test_favorites_list_reports_the_match_that_depends_on_them(): void
    {
        [$ana, , , , $matchId] = $this->criarMatchReciproco();

        $this->actingAs($ana)->getJson('/api/interesses')->assertOk()
            ->assertJsonPath('data.0.match_id', $matchId);
    }

    public function test_non_numeric_ids_return_not_found_instead_of_server_error(): void
    {
        $ana = User::factory()->create();

        $this->actingAs($ana)->getJson('/api/conversas/abc/mensagens')->assertNotFound();
        $this->actingAs($ana)->getJson('/api/matches/abc')->assertNotFound();
        $this->actingAs($ana)->postJson('/api/matches/abc/cancelar')->assertNotFound();
        $this->getJson('/api/postagens/abc')->assertNotFound();
        $this->getJson('/api/servicos/abc')->assertNotFound();
    }
}
