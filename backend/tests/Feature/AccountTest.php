<?php

namespace Tests\Feature;

use App\Models\User; // Cria contas controladas para os cenários.
use Illuminate\Foundation\Testing\RefreshDatabase; // Recria as tabelas no SQLite em memória definido no phpunit.xml.
use Illuminate\Support\Facades\Auth; // Limpa a autenticação entre requisições quando necessário.
use Illuminate\Support\Facades\Hash; // Confere que as senhas foram armazenadas como hash.
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase; // Os testes não precisam das credenciais do Supabase.

    // Simula o corpo que o formulário de cadastro enviará.
    private function registration(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Ana',
            'email' => 'ana@example.com',
            'password' => 'Senha12345',
            'password_confirmation' => 'Senha12345',
        ], $overrides);
    }

    public function test_registration_persists_normalizes_and_hides_password(): void
    {
        $this->postJson('/api/register', $this->registration(['email' => 'ANA@example.com', 'is_admin' => true]))
            ->assertCreated()->assertJsonPath('data.email', 'ana@example.com')
            ->assertJsonMissingPath('data.password')->assertJsonMissingPath('data.remember_token')
            ->assertJsonMissingPath('data.is_admin');
        $user = User::firstOrFail();
        $this->assertTrue(Hash::check('Senha12345', $user->password));
        $this->assertAuthenticatedAs($user);
        $this->getJson('/api/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_registration_rejects_invalid_and_duplicate_data(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
        $this->postJson('/api/register', $this->registration(['password_confirmation' => 'diferente']))
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        User::factory()->create(['email' => 'ana@example.com']);
        $this->postJson('/api/register', $this->registration(['email' => 'ANA@example.com']))
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_guests_cannot_access_account_routes_even_without_accept_header(): void
    {
        $this->get('/api/me')->assertUnauthorized();
        $this->patchJson('/api/me', ['name' => 'Intruso'])->assertUnauthorized();
        $this->deleteJson('/api/me', ['current_password' => 'password'])->assertUnauthorized();
        $this->postJson('/api/logout')->assertUnauthorized();
    }

    public function test_login_and_logout(): void
    {
        $user = User::factory()->create(['email' => 'ana@example.com']);
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'errada'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertGuest();
        $this->postJson('/api/login', ['email' => 'ANA@example.com', 'password' => 'password'])
            ->assertOk()->assertJsonMissingPath('data.password');
        $this->assertAuthenticatedAs($user);
        $this->postJson('/api/logout')->assertNoContent();
        $this->assertGuest();
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_update_only_changes_authenticated_user_and_allowed_fields(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($owner)->patchJson('/api/me', [
            'name' => 'Novo nome', 'id' => $other->id, 'is_admin' => true,
            'email_verified_at' => '2026-01-01',
        ])->assertOk()->assertJsonPath('data.id', $owner->id);
        $this->assertSame('Novo nome', $owner->fresh()->name);
        $this->assertSame($other->name, $other->fresh()->name);
        $this->assertSame($owner->email, $owner->fresh()->email);
        $this->getJson('/api/users')->assertNotFound(); // Ainda não existe listagem administrativa.
        $this->patchJson('/api/users/'.$other->id, ['name' => 'Intruso'])->assertNotFound();
    }

    public function test_email_change_requires_password_and_resets_verification(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->patchJson('/api/me', ['email' => 'novo@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->patchJson('/api/me', ['email' => 'NOVO@example.com', 'current_password' => 'password'])
            ->assertOk()->assertJsonPath('data.email', 'novo@example.com')
            ->assertJsonPath('data.email_verified_at', null);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'novo@example.com']);
    }

    public function test_email_update_rejects_another_accounts_email_but_accepts_own(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($user)->patchJson('/api/me', ['email' => $other->email, 'current_password' => 'password'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->patchJson('/api/me', ['email' => $user->email, 'current_password' => 'password'])->assertOk();
    }

    public function test_password_update_requires_current_password_and_hashes_new_password(): void
    {
        $user = User::factory()->create();
        $data = ['password' => 'NovaSenha123', 'password_confirmation' => 'NovaSenha123'];
        $this->actingAs($user)->patchJson('/api/me', $data + ['current_password' => 'errada'])
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->patchJson('/api/me', $data + ['current_password' => 'password'])
            ->assertOk()->assertJsonMissingPath('data.password');
        $this->assertTrue(Hash::check('NovaSenha123', $user->fresh()->password));
        $this->getJson('/api/me')->assertOk(); // A sessão atual continua utilizável.
    }

    public function test_changed_password_invalidates_stale_session(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])->assertOk();
        $this->getJson('/api/me')->assertOk(); // Registra o hash na sessão autenticada.
        User::findOrFail($user->id)->update(['password' => 'AlteradaEmOutraSessao']);
        Auth::forgetGuards(); // Força recarregar o usuário do banco na requisição seguinte.
        $this->getJson('/api/me')->assertUnauthorized();
    }

    public function test_delete_requires_password_and_preserves_other_users(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($user)->deleteJson('/api/me', ['current_password' => 'errada'])
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->assertDatabaseHas('users', ['id' => $user->id]);
        $this->deleteJson('/api/me', ['current_password' => 'password', 'id' => $other->id])->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseHas('users', ['id' => $other->id]);
        $this->assertGuest();
    }

    public function test_csrf_endpoint_and_protection_with_middleware_enabled(): void
    {
        // O Laravel dispensa CSRF em testes; alterar só o ambiente deste teste ativa a checagem real.
        $this->app->instance('env', 'local');
        $token = $this->getJson('/api/csrf-token')->assertOk()->assertJsonStructure(['csrf_token'])
            ->json('csrf_token');
        $this->postJson('/api/register', $this->registration())->assertStatus(419);
        $this->withHeader('X-CSRF-TOKEN', $token)->postJson('/api/register', $this->registration())->assertCreated();
    }

    public function test_cors_allows_configured_frontend_with_credentials(): void
    {
        $this->withHeaders([
            'Origin' => config('cors.allowed_origins')[0],
            'Access-Control-Request-Method' => 'PATCH',
            'Access-Control-Request-Headers' => 'content-type,x-csrf-token',
        ])->options('/api/me')->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', config('cors.allowed_origins')[0])
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_cors_does_not_authorize_unknown_origin(): void
    {
        $this->withHeaders(['Origin' => 'https://estranho.example', 'Access-Control-Request-Method' => 'PATCH'])
            ->options('/api/me')->assertHeader('Access-Control-Allow-Origin', config('cors.allowed_origins')[0]);
        // O navegador rejeita porque a origem autorizada é diferente da origem solicitante.
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', ['email' => 'ausente@example.com', 'password' => 'errada'])
                ->assertUnprocessable();
        }
        $this->postJson('/api/login', ['email' => 'ausente@example.com', 'password' => 'errada'])
            ->assertTooManyRequests();
    }
}
