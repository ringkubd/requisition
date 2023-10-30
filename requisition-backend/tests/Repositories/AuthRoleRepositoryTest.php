<?php

namespace Tests\Repositories;

use App\Models\AuthRole;
use App\Repositories\AuthRoleRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class AuthRoleRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected AuthRoleRepository $authRoleRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->authRoleRepo = app(AuthRoleRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_auth_role()
    {
        $authRole = AuthRole::factory()->make()->toArray();

        $createdAuthRole = $this->authRoleRepo->create($authRole);

        $createdAuthRole = $createdAuthRole->toArray();
        $this->assertArrayHasKey('id', $createdAuthRole);
        $this->assertNotNull($createdAuthRole['id'], 'Created AuthRole must have id specified');
        $this->assertNotNull(AuthRole::find($createdAuthRole['id']), 'AuthRole with given id must be in DB');
        $this->assertModelData($authRole, $createdAuthRole);
    }

    /**
     * @test read
     */
    public function test_read_auth_role()
    {
        $authRole = AuthRole::factory()->create();

        $dbAuthRole = $this->authRoleRepo->find($authRole->id);

        $dbAuthRole = $dbAuthRole->toArray();
        $this->assertModelData($authRole->toArray(), $dbAuthRole);
    }

    /**
     * @test update
     */
    public function test_update_auth_role()
    {
        $authRole = AuthRole::factory()->create();
        $fakeAuthRole = AuthRole::factory()->make()->toArray();

        $updatedAuthRole = $this->authRoleRepo->update($fakeAuthRole, $authRole->id);

        $this->assertModelData($fakeAuthRole, $updatedAuthRole->toArray());
        $dbAuthRole = $this->authRoleRepo->find($authRole->id);
        $this->assertModelData($fakeAuthRole, $dbAuthRole->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_auth_role()
    {
        $authRole = AuthRole::factory()->create();

        $resp = $this->authRoleRepo->delete($authRole->id);

        $this->assertTrue($resp);
        $this->assertNull(AuthRole::find($authRole->id), 'AuthRole should not exist in DB');
    }
}
