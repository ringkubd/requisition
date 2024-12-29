<?php

namespace Tests\Repositories;

use App\Models\App/Models/Auth/Role;
use App\Repositories\App/Models/Auth/RoleRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class App/Models/Auth/RoleRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected App/Models/Auth/RoleRepository $app/Models/Auth/RoleRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->app/Models/Auth/RoleRepo = app(App/Models/Auth/RoleRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->make()->toArray();

        $createdApp/Models/Auth/Role = $this->app/Models/Auth/RoleRepo->create($app/Models/Auth/Role);

        $createdApp/Models/Auth/Role = $createdApp/Models/Auth/Role->toArray();
        $this->assertArrayHasKey('id', $createdApp/Models/Auth/Role);
        $this->assertNotNull($createdApp/Models/Auth/Role['id'], 'Created App/Models/Auth/Role must have id specified');
        $this->assertNotNull(App/Models/Auth/Role::find($createdApp/Models/Auth/Role['id']), 'App/Models/Auth/Role with given id must be in DB');
        $this->assertModelData($app/Models/Auth/Role, $createdApp/Models/Auth/Role);
    }

    /**
     * @test read
     */
    public function test_read_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();

        $dbApp/Models/Auth/Role = $this->app/Models/Auth/RoleRepo->find($app/Models/Auth/Role->id);

        $dbApp/Models/Auth/Role = $dbApp/Models/Auth/Role->toArray();
        $this->assertModelData($app/Models/Auth/Role->toArray(), $dbApp/Models/Auth/Role);
    }

    /**
     * @test update
     */
    public function test_update_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();
        $fakeApp/Models/Auth/Role = App/Models/Auth/Role::factory()->make()->toArray();

        $updatedApp/Models/Auth/Role = $this->app/Models/Auth/RoleRepo->update($fakeApp/Models/Auth/Role, $app/Models/Auth/Role->id);

        $this->assertModelData($fakeApp/Models/Auth/Role, $updatedApp/Models/Auth/Role->toArray());
        $dbApp/Models/Auth/Role = $this->app/Models/Auth/RoleRepo->find($app/Models/Auth/Role->id);
        $this->assertModelData($fakeApp/Models/Auth/Role, $dbApp/Models/Auth/Role->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_app/_models/_auth/_role()
    {
        $app/Models/Auth/Role = App/Models/Auth/Role::factory()->create();

        $resp = $this->app/Models/Auth/RoleRepo->delete($app/Models/Auth/Role->id);

        $this->assertTrue($resp);
        $this->assertNull(App/Models/Auth/Role::find($app/Models/Auth/Role->id), 'App/Models/Auth/Role should not exist in DB');
    }
}
