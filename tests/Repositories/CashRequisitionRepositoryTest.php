<?php

namespace Tests\Repositories;

use App\Models\CashRequisition;
use App\Repositories\CashRequisitionRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class CashRequisitionRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected CashRequisitionRepository $cashRequisitionRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->cashRequisitionRepo = app(CashRequisitionRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->make()->toArray();

        $createdCashRequisition = $this->cashRequisitionRepo->create($cashRequisition);

        $createdCashRequisition = $createdCashRequisition->toArray();
        $this->assertArrayHasKey('id', $createdCashRequisition);
        $this->assertNotNull($createdCashRequisition['id'], 'Created CashRequisition must have id specified');
        $this->assertNotNull(CashRequisition::find($createdCashRequisition['id']), 'CashRequisition with given id must be in DB');
        $this->assertModelData($cashRequisition, $createdCashRequisition);
    }

    /**
     * @test read
     */
    public function test_read_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();

        $dbCashRequisition = $this->cashRequisitionRepo->find($cashRequisition->id);

        $dbCashRequisition = $dbCashRequisition->toArray();
        $this->assertModelData($cashRequisition->toArray(), $dbCashRequisition);
    }

    /**
     * @test update
     */
    public function test_update_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();
        $fakeCashRequisition = CashRequisition::factory()->make()->toArray();

        $updatedCashRequisition = $this->cashRequisitionRepo->update($fakeCashRequisition, $cashRequisition->id);

        $this->assertModelData($fakeCashRequisition, $updatedCashRequisition->toArray());
        $dbCashRequisition = $this->cashRequisitionRepo->find($cashRequisition->id);
        $this->assertModelData($fakeCashRequisition, $dbCashRequisition->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();

        $resp = $this->cashRequisitionRepo->delete($cashRequisition->id);

        $this->assertTrue($resp);
        $this->assertNull(CashRequisition::find($cashRequisition->id), 'CashRequisition should not exist in DB');
    }
}
