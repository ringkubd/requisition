<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Auth/Role;

class Auth/RoleApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/auth/-roles', $auth/Role
        );

        $this->assertApiResponse($auth/Role);
    }

    /**
     * @test
     */
    public function test_read_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/auth/-roles/'.$auth/Role->id
        );

        $this->assertApiResponse($auth/Role->toArray());
    }

    /**
     * @test
     */
    public function test_update_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();
        $editedAuth/Role = Auth/Role::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/auth/-roles/'.$auth/Role->id,
            $editedAuth/Role
        );

        $this->assertApiResponse($editedAuth/Role);
    }

    /**
     * @test
     */
    public function test_delete_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/auth/-roles/'.$auth/Role->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/auth/-roles/'.$auth/Role->id
        );

        $this->response->assertStatus(404);
    }
}
