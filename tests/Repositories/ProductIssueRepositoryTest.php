<?php

namespace Tests\Repositories;

use App\Models\ProductIssue;
use App\Repositories\ProductIssueRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class ProductIssueRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected ProductIssueRepository $productIssueRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->productIssueRepo = app(ProductIssueRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_product_issue()
    {
        $productIssue = ProductIssue::factory()->make()->toArray();

        $createdProductIssue = $this->productIssueRepo->create($productIssue);

        $createdProductIssue = $createdProductIssue->toArray();
        $this->assertArrayHasKey('id', $createdProductIssue);
        $this->assertNotNull($createdProductIssue['id'], 'Created ProductIssue must have id specified');
        $this->assertNotNull(ProductIssue::find($createdProductIssue['id']), 'ProductIssue with given id must be in DB');
        $this->assertModelData($productIssue, $createdProductIssue);
    }

    /**
     * @test read
     */
    public function test_read_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();

        $dbProductIssue = $this->productIssueRepo->find($productIssue->id);

        $dbProductIssue = $dbProductIssue->toArray();
        $this->assertModelData($productIssue->toArray(), $dbProductIssue);
    }

    /**
     * @test update
     */
    public function test_update_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();
        $fakeProductIssue = ProductIssue::factory()->make()->toArray();

        $updatedProductIssue = $this->productIssueRepo->update($fakeProductIssue, $productIssue->id);

        $this->assertModelData($fakeProductIssue, $updatedProductIssue->toArray());
        $dbProductIssue = $this->productIssueRepo->find($productIssue->id);
        $this->assertModelData($fakeProductIssue, $dbProductIssue->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();

        $resp = $this->productIssueRepo->delete($productIssue->id);

        $this->assertTrue($resp);
        $this->assertNull(ProductIssue::find($productIssue->id), 'ProductIssue should not exist in DB');
    }
}
