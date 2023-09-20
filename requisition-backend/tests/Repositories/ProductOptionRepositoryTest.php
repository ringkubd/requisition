<?php

namespace Tests\Repositories;

use App\Models\ProductOption;
use App\Repositories\ProductOptionRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class ProductOptionRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected ProductOptionRepository $productOptionRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->productOptionRepo = app(ProductOptionRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_product_option()
    {
        $productOption = ProductOption::factory()->make()->toArray();

        $createdProductOption = $this->productOptionRepo->create($productOption);

        $createdProductOption = $createdProductOption->toArray();
        $this->assertArrayHasKey('id', $createdProductOption);
        $this->assertNotNull($createdProductOption['id'], 'Created ProductOption must have id specified');
        $this->assertNotNull(ProductOption::find($createdProductOption['id']), 'ProductOption with given id must be in DB');
        $this->assertModelData($productOption, $createdProductOption);
    }

    /**
     * @test read
     */
    public function test_read_product_option()
    {
        $productOption = ProductOption::factory()->create();

        $dbProductOption = $this->productOptionRepo->find($productOption->id);

        $dbProductOption = $dbProductOption->toArray();
        $this->assertModelData($productOption->toArray(), $dbProductOption);
    }

    /**
     * @test update
     */
    public function test_update_product_option()
    {
        $productOption = ProductOption::factory()->create();
        $fakeProductOption = ProductOption::factory()->make()->toArray();

        $updatedProductOption = $this->productOptionRepo->update($fakeProductOption, $productOption->id);

        $this->assertModelData($fakeProductOption, $updatedProductOption->toArray());
        $dbProductOption = $this->productOptionRepo->find($productOption->id);
        $this->assertModelData($fakeProductOption, $dbProductOption->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_product_option()
    {
        $productOption = ProductOption::factory()->create();

        $resp = $this->productOptionRepo->delete($productOption->id);

        $this->assertTrue($resp);
        $this->assertNull(ProductOption::find($productOption->id), 'ProductOption should not exist in DB');
    }
}
