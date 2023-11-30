<?php

namespace Tests\Repositories;

use App\Models\CashProduct;
use App\Repositories\CashProductRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class CashProductRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected CashProductRepository $cashProductRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->cashProductRepo = app(CashProductRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_cash_product()
    {
        $cashProduct = CashProduct::factory()->make()->toArray();

        $createdCashProduct = $this->cashProductRepo->create($cashProduct);

        $createdCashProduct = $createdCashProduct->toArray();
        $this->assertArrayHasKey('id', $createdCashProduct);
        $this->assertNotNull($createdCashProduct['id'], 'Created CashProduct must have id specified');
        $this->assertNotNull(CashProduct::find($createdCashProduct['id']), 'CashProduct with given id must be in DB');
        $this->assertModelData($cashProduct, $createdCashProduct);
    }

    /**
     * @test read
     */
    public function test_read_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();

        $dbCashProduct = $this->cashProductRepo->find($cashProduct->id);

        $dbCashProduct = $dbCashProduct->toArray();
        $this->assertModelData($cashProduct->toArray(), $dbCashProduct);
    }

    /**
     * @test update
     */
    public function test_update_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();
        $fakeCashProduct = CashProduct::factory()->make()->toArray();

        $updatedCashProduct = $this->cashProductRepo->update($fakeCashProduct, $cashProduct->id);

        $this->assertModelData($fakeCashProduct, $updatedCashProduct->toArray());
        $dbCashProduct = $this->cashProductRepo->find($cashProduct->id);
        $this->assertModelData($fakeCashProduct, $dbCashProduct->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();

        $resp = $this->cashProductRepo->delete($cashProduct->id);

        $this->assertTrue($resp);
        $this->assertNull(CashProduct::find($cashProduct->id), 'CashProduct should not exist in DB');
    }
}
