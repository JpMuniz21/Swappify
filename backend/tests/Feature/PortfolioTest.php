<?php

namespace Tests\Feature;

use App\Http\Controllers\PortfolioController;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    // PNG 1x1 real (o container não tem GD para gerar imagens falsas).
    private static function png(string $nome): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($nome, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        ));
    }

    public function test_guest_cannot_access_portfolio(): void
    {
        $this->getJson('/api/me/portfolio')->assertUnauthorized();
        $this->postJson('/api/me/portfolio', ['titulo' => 'x'])->assertUnauthorized();
    }

    public function test_user_adds_lists_and_removes_photos_and_me_returns_them(): void
    {
        Storage::fake('public');
        $eu = User::factory()->create();

        $resposta = $this->actingAs($eu)->post('/api/me/portfolio', [
            'titulo' => 'Reforma da cozinha',
            'imagem' => self::png('cozinha.png'),
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.titulo', 'Reforma da cozinha');

        $id = $resposta->json('data.id');
        $url = $resposta->json('data.imagem_url');
        $this->assertStringContainsString('/storage/portfolio/', $url);
        Storage::disk('public')->assertExists('portfolio/'.basename($url));

        $this->actingAs($eu)->getJson('/api/me/portfolio')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($eu)->getJson('/api/me')->assertOk()
            ->assertJsonPath('data.portfolio.0.titulo', 'Reforma da cozinha');

        $this->actingAs($eu)->deleteJson("/api/me/portfolio/{$id}")->assertOk();
        $this->assertDatabaseMissing('portfolio_itens', ['id' => $id]);
        Storage::disk('public')->assertMissing('portfolio/'.basename($url));
    }

    public function test_validation_limit_and_ownership(): void
    {
        Storage::fake('public');
        $eu = User::factory()->create();
        $outro = User::factory()->create();
        $json = ['Accept' => 'application/json'];
        $foto = fn () => self::png('foto.png');

        $this->actingAs($eu)->post('/api/me/portfolio', ['titulo' => 'Sem foto'], $json)->assertUnprocessable();
        $this->actingAs($eu)->post('/api/me/portfolio', ['imagem' => $foto()], $json)->assertUnprocessable();
        $this->actingAs($eu)->post('/api/me/portfolio', [
            'titulo' => 'PDF', 'imagem' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ], $json)->assertUnprocessable();
        $this->actingAs($eu)->post('/api/me/portfolio', [
            'titulo' => 'Grande', 'imagem' => UploadedFile::fake()->create('g.jpg', 5000, 'image/jpeg'),
        ], $json)->assertUnprocessable();

        for ($i = 0; $i < PortfolioController::LIMITE; $i++) {
            $this->actingAs($eu)->post('/api/me/portfolio', ['titulo' => "Foto $i", 'imagem' => $foto()], $json)->assertCreated();
        }
        $this->actingAs($eu)->post('/api/me/portfolio', ['titulo' => 'Extra', 'imagem' => $foto()], $json)->assertUnprocessable();

        $idDoOutro = $this->actingAs($outro)->post('/api/me/portfolio', ['titulo' => 'Dele', 'imagem' => $foto()], $json)
            ->assertCreated()->json('data.id');
        $this->actingAs($eu)->deleteJson("/api/me/portfolio/{$idDoOutro}")->assertForbidden();
        $this->actingAs($eu)->deleteJson('/api/me/portfolio/abc')->assertNotFound();
    }
}
