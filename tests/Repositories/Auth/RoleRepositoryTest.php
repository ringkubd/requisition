<?php

namespace Tests\Repositories;

use App\Models\Auth/Role;
use App\Repositories\Auth/RoleRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class Auth/RoleRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected Auth/RoleRepository $auth/RoleRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->auth/RoleRepo = app(Auth/RoleRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->make()->toArray();

        $createdAuth/Role = $this->auth/RoleRepo->create($auth/Role);

        $createdAuth/Role = $createdAuth/Role->toArray();
        $this->assertArrayHasKey('id', $createdAuth/Role);
        $this->assertNotNull($createdAuth/Role['id'], 'Created Auth/Role must have id specified');
        $this->assertNotNull(Auth/Role::find($createdAuth/Role['id']), 'Auth/Role with given id must be in DB');
        $this->assertModelData($auth/Role, $createdAuth/Role);
    }

    /**
     * @test read
     */
    public function test_read_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();

        $dbAuth/Role = $this->auth/RoleRepo->find($auth/Role->id);

        $dbAuth/Role = $dbAuth/Role->toArray();
        $this->assertModelData($auth/Role->toArray(), $dbAuth/Role);
    }

    /**
     * @test update
     */
    public function test_update_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();
        $fakeAuth/Role = Auth/Role::factory()->make()->toArray();

        $updatedAuth/Role = $this->auth/RoleRepo->update($fakeAuth/Role, $auth/Role->id);

        $this->assertModelData($fakeAuth/Role, $updatedAuth/Role->toArray());
        $dbAuth/Role = $this->auth/RoleRepo->find($auth/Role->id);
        $this->assertModelData($fakeAuth/Role, $dbAuth/Role->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_auth/_role()
    {
        $auth/Role = Auth/Role::factory()->create();

        $resp = $this->auth/RoleRepo->delete($auth/Role->id);

        $this->assertTrue($resp);
        $this->assertNull(Auth/Role::find($auth/Role->id), 'Auth/Role should not exist in DB');
    }
}
