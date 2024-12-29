<?php

namespace Tests\Repositories;

use App\Models\Purchase;
use App\Repositories\PurchaseRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class PurchaseRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected PurchaseRepository $purchaseRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->purchaseRepo = app(PurchaseRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_purchase()
    {
        $purchase = Purchase::factory()->make()->toArray();

        $createdPurchase = $this->purchaseRepo->create($purchase);

        $createdPurchase = $createdPurchase->toArray();
        $this->assertArrayHasKey('id', $createdPurchase);
        $this->assertNotNull($createdPurchase['id'], 'Created Purchase must have id specified');
        $this->assertNotNull(Purchase::find($createdPurchase['id']), 'Purchase with given id must be in DB');
        $this->assertModelData($purchase, $createdPurchase);
    }

    /**
     * @test read
     */
    public function test_read_purchase()
    {
        $purchase = Purchase::factory()->create();

        $dbPurchase = $this->purchaseRepo->find($purchase->id);

        $dbPurchase = $dbPurchase->toArray();
        $this->assertModelData($purchase->toArray(), $dbPurchase);
    }

    /**
     * @test update
     */
    public function test_update_purchase()
    {
        $purchase = Purchase::factory()->create();
        $fakePurchase = Purchase::factory()->make()->toArray();

        $updatedPurchase = $this->purchaseRepo->update($fakePurchase, $purchase->id);

        $this->assertModelData($fakePurchase, $updatedPurchase->toArray());
        $dbPurchase = $this->purchaseRepo->find($purchase->id);
        $this->assertModelData($fakePurchase, $dbPurchase->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_purchase()
    {
        $purchase = Purchase::factory()->create();

        $resp = $this->purchaseRepo->delete($purchase->id);

        $this->assertTrue($resp);
        $this->assertNull(Purchase::find($purchase->id), 'Purchase should not exist in DB');
    }
}
