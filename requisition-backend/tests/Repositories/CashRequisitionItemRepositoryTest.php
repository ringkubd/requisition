<?php

namespace Tests\Repositories;

use App\Models\CashRequisitionItem;
use App\Repositories\CashRequisitionItemRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class CashRequisitionItemRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected CashRequisitionItemRepository $cashRequisitionItemRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->cashRequisitionItemRepo = app(CashRequisitionItemRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->make()->toArray();

        $createdCashRequisitionItem = $this->cashRequisitionItemRepo->create($cashRequisitionItem);

        $createdCashRequisitionItem = $createdCashRequisitionItem->toArray();
        $this->assertArrayHasKey('id', $createdCashRequisitionItem);
        $this->assertNotNull($createdCashRequisitionItem['id'], 'Created CashRequisitionItem must have id specified');
        $this->assertNotNull(CashRequisitionItem::find($createdCashRequisitionItem['id']), 'CashRequisitionItem with given id must be in DB');
        $this->assertModelData($cashRequisitionItem, $createdCashRequisitionItem);
    }

    /**
     * @test read
     */
    public function test_read_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();

        $dbCashRequisitionItem = $this->cashRequisitionItemRepo->find($cashRequisitionItem->id);

        $dbCashRequisitionItem = $dbCashRequisitionItem->toArray();
        $this->assertModelData($cashRequisitionItem->toArray(), $dbCashRequisitionItem);
    }

    /**
     * @test update
     */
    public function test_update_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();
        $fakeCashRequisitionItem = CashRequisitionItem::factory()->make()->toArray();

        $updatedCashRequisitionItem = $this->cashRequisitionItemRepo->update($fakeCashRequisitionItem, $cashRequisitionItem->id);

        $this->assertModelData($fakeCashRequisitionItem, $updatedCashRequisitionItem->toArray());
        $dbCashRequisitionItem = $this->cashRequisitionItemRepo->find($cashRequisitionItem->id);
        $this->assertModelData($fakeCashRequisitionItem, $dbCashRequisitionItem->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();

        $resp = $this->cashRequisitionItemRepo->delete($cashRequisitionItem->id);

        $this->assertTrue($resp);
        $this->assertNull(CashRequisitionItem::find($cashRequisitionItem->id), 'CashRequisitionItem should not exist in DB');
    }
}
