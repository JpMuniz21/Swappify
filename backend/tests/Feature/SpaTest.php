<?php

namespace Tests\Feature;

use Tests\TestCase;

class SpaTest extends TestCase
{
    private string $pagina;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pagina = public_path('index.html');
    }

    protected function tearDown(): void
    {
        if (is_file($this->pagina) && str_contains((string) file_get_contents($this->pagina), 'teste-spa')) {
            unlink($this->pagina);
        }
        parent::tearDown();
    }

    private function assertEntregaPaginaDoReact(string $url): void
    {
        $resposta = $this->get($url)->assertOk();
        $this->assertStringContainsString('no-cache', (string) $resposta->headers->get('Cache-Control'));
        $this->assertSame(realpath($this->pagina), $resposta->baseResponse->getFile()->getRealPath(), "{$url} deve entregar o index.html");
    }

    public function test_without_react_build_root_returns_api_info(): void
    {
        $this->assertFileDoesNotExist($this->pagina, 'Não deve existir public/index.html no repositório.');
        $this->get('/')->assertOk()->assertJsonPath('service', 'Swappify API');
        $this->get('/feed')->assertNotFound();
    }

    public function test_with_react_build_pages_return_index_and_api_stays_json(): void
    {
        file_put_contents($this->pagina, '<!doctype html><div id="root">teste-spa</div>');

        foreach (['/', '/feed', '/perfil/qualquer/coisa'] as $url) {
            $this->assertEntregaPaginaDoReact($url);
        }

        // a API não é engolida pela página do React
        $this->getJson('/api/health')->assertOk()->assertJsonPath('status', 'ok');
        $this->getJson('/api/rota-que-nao-existe')->assertNotFound()->assertJsonStructure(['message']);
        $this->post('/feed')->assertNotFound();

        // abrir uma página não cria cookie de sessão
        $this->get('/feed')->assertCookieMissing(config('session.cookie'));
    }
}
