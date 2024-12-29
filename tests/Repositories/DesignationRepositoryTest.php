<?php

namespace Tests\Repositories;

use App\Models\Designation;
use App\Repositories\DesignationRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class DesignationRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected DesignationRepository $designationRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->designationRepo = app(DesignationRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_designation()
    {
        $designation = Designation::factory()->make()->toArray();

        $createdDesignation = $this->designationRepo->create($designation);

        $createdDesignation = $createdDesignation->toArray();
        $this->assertArrayHasKey('id', $createdDesignation);
        $this->assertNotNull($createdDesignation['id'], 'Created Designation must have id specified');
        $this->assertNotNull(Designation::find($createdDesignation['id']), 'Designation with given id must be in DB');
        $this->assertModelData($designation, $createdDesignation);
    }

    /**
     * @test read
     */
    public function test_read_designation()
    {
        $designation = Designation::factory()->create();

        $dbDesignation = $this->designationRepo->find($designation->id);

        $dbDesignation = $dbDesignation->toArray();
        $this->assertModelData($designation->toArray(), $dbDesignation);
    }

    /**
     * @test update
     */
    public function test_update_designation()
    {
        $designation = Designation::factory()->create();
        $fakeDesignation = Designation::factory()->make()->toArray();

        $updatedDesignation = $this->designationRepo->update($fakeDesignation, $designation->id);

        $this->assertModelData($fakeDesignation, $updatedDesignation->toArray());
        $dbDesignation = $this->designationRepo->find($designation->id);
        $this->assertModelData($fakeDesignation, $dbDesignation->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_designation()
    {
        $designation = Designation::factory()->create();

        $resp = $this->designationRepo->delete($designation->id);

        $this->assertTrue($resp);
        $this->assertNull(Designation::find($designation->id), 'Designation should not exist in DB');
    }
}
