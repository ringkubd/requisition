<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\AuthRole;

class AuthRoleApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_auth_role()
    {
        $authRole = AuthRole::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/auth-roles', $authRole
        );

        $this->assertApiResponse($authRole);
    }

    /**
     * @test
     */
    public function test_read_auth_role()
    {
        $authRole = AuthRole::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/auth-roles/'.$authRole->id
        );

        $this->assertApiResponse($authRole->toArray());
    }

    /**
     * @test
     */
    public function test_update_auth_role()
    {
        $authRole = AuthRole::factory()->create();
        $editedAuthRole = AuthRole::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/auth-roles/'.$authRole->id,
            $editedAuthRole
        );

        $this->assertApiResponse($editedAuthRole);
    }

    /**
     * @test
     */
    public function test_delete_auth_role()
    {
        $authRole = AuthRole::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/auth-roles/'.$authRole->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/auth-roles/'.$authRole->id
        );

        $this->response->assertStatus(404);
    }
}
