<?php

namespace Tests\Repositories;

use App\Models\InitialRequisition;
use App\Repositories\InitialRequisitionRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class InitialRequisitionRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected InitialRequisitionRepository $initialRequisitionRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->initialRequisitionRepo = app(InitialRequisitionRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->make()->toArray();

        $createdInitialRequisition = $this->initialRequisitionRepo->create($initialRequisition);

        $createdInitialRequisition = $createdInitialRequisition->toArray();
        $this->assertArrayHasKey('id', $createdInitialRequisition);
        $this->assertNotNull($createdInitialRequisition['id'], 'Created InitialRequisition must have id specified');
        $this->assertNotNull(InitialRequisition::find($createdInitialRequisition['id']), 'InitialRequisition with given id must be in DB');
        $this->assertModelData($initialRequisition, $createdInitialRequisition);
    }

    /**
     * @test read
     */
    public function test_read_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();

        $dbInitialRequisition = $this->initialRequisitionRepo->find($initialRequisition->id);

        $dbInitialRequisition = $dbInitialRequisition->toArray();
        $this->assertModelData($initialRequisition->toArray(), $dbInitialRequisition);
    }

    /**
     * @test update
     */
    public function test_update_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();
        $fakeInitialRequisition = InitialRequisition::factory()->make()->toArray();

        $updatedInitialRequisition = $this->initialRequisitionRepo->update($fakeInitialRequisition, $initialRequisition->id);

        $this->assertModelData($fakeInitialRequisition, $updatedInitialRequisition->toArray());
        $dbInitialRequisition = $this->initialRequisitionRepo->find($initialRequisition->id);
        $this->assertModelData($fakeInitialRequisition, $dbInitialRequisition->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();

        $resp = $this->initialRequisitionRepo->delete($initialRequisition->id);

        $this->assertTrue($resp);
        $this->assertNull(InitialRequisition::find($initialRequisition->id), 'InitialRequisition should not exist in DB');
    }
}
