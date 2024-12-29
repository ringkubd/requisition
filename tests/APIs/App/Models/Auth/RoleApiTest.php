<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\App/Models/Auth/Role;

class App/Models/Auth/RoleApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/app/-models/-auth/-roles', $app/Models/Auth/Role
        );

        $this->assertApiResponse($app/Models/Auth/Role);
    }

    /**
     * @test
     */
    public function test_read_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/app/-models/-auth/-roles/'.$app/Models/Auth/Role->id
        );

        $this->assertApiResponse($app/Models/Auth/Role->toArray());
    }

    /**
     * @test
     */
    public function test_update_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();
        $editedApp/Models/Auth/Role = App/Models/Auth/Role::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/app/-models/-auth/-roles/'.$app/Models/Auth/Role->id,
            $editedApp/Models/Auth/Role
        );

        $this->assertApiResponse($editedApp/Models/Auth/Role);
    }

    /**
     * @test
     */
    public function test_delete_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/app/-models/-auth/-roles/'.$app/Models/Auth/Role->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/app/-models/-auth/-roles/'.$app/Models/Auth/Role->id
        );

        $this->response->assertStatus(404);
    }
}
