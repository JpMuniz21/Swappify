<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class UserProfileMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_upgrades_original_users_table_without_losing_accounts(): void
    {
        $migration = require database_path('migrations/2026_09_30_000001_integrate_user_profile_fields.php');
        $migration->down(); // Simula o schema original da branch de usuários.
        $id = DB::table('users')->insertGetId([
            'name' => 'Conta antiga', 'email' => 'antiga@example.com',
            'password' => 'hash-preservado', 'created_at' => '2026-01-15 12:00:00',
        ]);
        $migration->up();
        $this->assertDatabaseHas('users', [
            'id' => $id, 'email' => 'antiga@example.com',
            'password' => 'hash-preservado', 'registered_at' => '2026-01-15',
            'location_id' => null,
        ]);
    }

    public function test_upgrades_dev_schema_and_preserves_existing_profile_and_location(): void
    {
        $user = User::factory()->create(['profession' => 'Professora']);
        Schema::table('users', fn (Blueprint $table) => $table->unsignedBigInteger('location_id')->nullable(false)->change());
        $migration = require database_path('migrations/2026_09_30_000001_integrate_user_profile_fields.php');
        $migration->up(); // Simula a atualização do schema que já possui os campos.
        $this->assertDatabaseHas('users', [
            'id' => $user->id, 'profession' => 'Professora', 'location_id' => $user->location_id,
        ]);
        $newUser = User::create(['name' => 'Nova', 'email' => 'nova@example.com', 'password' => 'Senha12345']);
        $this->assertNull($newUser->fresh()->location_id);
        $this->assertNotNull($newUser->fresh()->registered_at);
    }
}
