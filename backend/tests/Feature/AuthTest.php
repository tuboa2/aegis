<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
          'name' => 'Test User',
          'email' => 'test@example.com',
          'password' => 'Password123!',
          'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(201)->assertJsonStructure([
          'user' => ['id', 'name', 'email'],
          'access_token'
        ]);
    }

    public function test_user_can_access_protected_rote()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/user');

        $response->assertStatus(200)->assertJson([
            'id' => $user->id,
            'email' => $user->email
        ]);
    }
}