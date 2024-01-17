<?php

namespace Tests\Repositories;

use App\Models\ProductIssueBasic;
use App\Repositories\ProductIssueBasicRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class ProductIssueBasicRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected ProductIssueBasicRepository $productIssueBasicRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->productIssueBasicRepo = app(ProductIssueBasicRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->make()->toArray();

        $createdProductIssueBasic = $this->productIssueBasicRepo->create($productIssueBasic);

        $createdProductIssueBasic = $createdProductIssueBasic->toArray();
        $this->assertArrayHasKey('id', $createdProductIssueBasic);
        $this->assertNotNull($createdProductIssueBasic['id'], 'Created ProductIssueBasic must have id specified');
        $this->assertNotNull(ProductIssueBasic::find($createdProductIssueBasic['id']), 'ProductIssueBasic with given id must be in DB');
        $this->assertModelData($productIssueBasic, $createdProductIssueBasic);
    }

    /**
     * @test read
     */
    public function test_read_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();

        $dbProductIssueBasic = $this->productIssueBasicRepo->find($productIssueBasic->id);

        $dbProductIssueBasic = $dbProductIssueBasic->toArray();
        $this->assertModelData($productIssueBasic->toArray(), $dbProductIssueBasic);
    }

    /**
     * @test update
     */
    public function test_update_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();
        $fakeProductIssueBasic = ProductIssueBasic::factory()->make()->toArray();

        $updatedProductIssueBasic = $this->productIssueBasicRepo->update($fakeProductIssueBasic, $productIssueBasic->id);

        $this->assertModelData($fakeProductIssueBasic, $updatedProductIssueBasic->toArray());
        $dbProductIssueBasic = $this->productIssueBasicRepo->find($productIssueBasic->id);
        $this->assertModelData($fakeProductIssueBasic, $dbProductIssueBasic->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();

        $resp = $this->productIssueBasicRepo->delete($productIssueBasic->id);

        $this->assertTrue($resp);
        $this->assertNull(ProductIssueBasic::find($productIssueBasic->id), 'ProductIssueBasic should not exist in DB');
    }
}
