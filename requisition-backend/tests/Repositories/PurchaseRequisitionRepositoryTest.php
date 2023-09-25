<?php

namespace Tests\Repositories;

use App\Models\PurchaseRequisition;
use App\Repositories\PurchaseRequisitionRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class PurchaseRequisitionRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected PurchaseRequisitionRepository $purchaseRequisitionRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->purchaseRequisitionRepo = app(PurchaseRequisitionRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->make()->toArray();

        $createdPurchaseRequisition = $this->purchaseRequisitionRepo->create($purchaseRequisition);

        $createdPurchaseRequisition = $createdPurchaseRequisition->toArray();
        $this->assertArrayHasKey('id', $createdPurchaseRequisition);
        $this->assertNotNull($createdPurchaseRequisition['id'], 'Created PurchaseRequisition must have id specified');
        $this->assertNotNull(PurchaseRequisition::find($createdPurchaseRequisition['id']), 'PurchaseRequisition with given id must be in DB');
        $this->assertModelData($purchaseRequisition, $createdPurchaseRequisition);
    }

    /**
     * @test read
     */
    public function test_read_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();

        $dbPurchaseRequisition = $this->purchaseRequisitionRepo->find($purchaseRequisition->id);

        $dbPurchaseRequisition = $dbPurchaseRequisition->toArray();
        $this->assertModelData($purchaseRequisition->toArray(), $dbPurchaseRequisition);
    }

    /**
     * @test update
     */
    public function test_update_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();
        $fakePurchaseRequisition = PurchaseRequisition::factory()->make()->toArray();

        $updatedPurchaseRequisition = $this->purchaseRequisitionRepo->update($fakePurchaseRequisition, $purchaseRequisition->id);

        $this->assertModelData($fakePurchaseRequisition, $updatedPurchaseRequisition->toArray());
        $dbPurchaseRequisition = $this->purchaseRequisitionRepo->find($purchaseRequisition->id);
        $this->assertModelData($fakePurchaseRequisition, $dbPurchaseRequisition->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();

        $resp = $this->purchaseRequisitionRepo->delete($purchaseRequisition->id);

        $this->assertTrue($resp);
        $this->assertNull(PurchaseRequisition::find($purchaseRequisition->id), 'PurchaseRequisition should not exist in DB');
    }
}
