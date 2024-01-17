<?php

namespace Tests\Repositories;

use App\Models\ProductIssueItems;
use App\Repositories\ProductIssueItemsRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class ProductIssueItemsRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected ProductIssueItemsRepository $productIssueItemsRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->productIssueItemsRepo = app(ProductIssueItemsRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->make()->toArray();

        $createdProductIssueItems = $this->productIssueItemsRepo->create($productIssueItems);

        $createdProductIssueItems = $createdProductIssueItems->toArray();
        $this->assertArrayHasKey('id', $createdProductIssueItems);
        $this->assertNotNull($createdProductIssueItems['id'], 'Created ProductIssueItems must have id specified');
        $this->assertNotNull(ProductIssueItems::find($createdProductIssueItems['id']), 'ProductIssueItems with given id must be in DB');
        $this->assertModelData($productIssueItems, $createdProductIssueItems);
    }

    /**
     * @test read
     */
    public function test_read_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();

        $dbProductIssueItems = $this->productIssueItemsRepo->find($productIssueItems->id);

        $dbProductIssueItems = $dbProductIssueItems->toArray();
        $this->assertModelData($productIssueItems->toArray(), $dbProductIssueItems);
    }

    /**
     * @test update
     */
    public function test_update_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();
        $fakeProductIssueItems = ProductIssueItems::factory()->make()->toArray();

        $updatedProductIssueItems = $this->productIssueItemsRepo->update($fakeProductIssueItems, $productIssueItems->id);

        $this->assertModelData($fakeProductIssueItems, $updatedProductIssueItems->toArray());
        $dbProductIssueItems = $this->productIssueItemsRepo->find($productIssueItems->id);
        $this->assertModelData($fakeProductIssueItems, $dbProductIssueItems->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();

        $resp = $this->productIssueItemsRepo->delete($productIssueItems->id);

        $this->assertTrue($resp);
        $this->assertNull(ProductIssueItems::find($productIssueItems->id), 'ProductIssueItems should not exist in DB');
    }
}
