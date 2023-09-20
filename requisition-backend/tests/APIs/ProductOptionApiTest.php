<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\ProductOption;

class ProductOptionApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_product_option()
    {
        $productOption = ProductOption::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/product-options', $productOption
        );

        $this->assertApiResponse($productOption);
    }

    /**
     * @test
     */
    public function test_read_product_option()
    {
        $productOption = ProductOption::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/product-options/'.$productOption->id
        );

        $this->assertApiResponse($productOption->toArray());
    }

    /**
     * @test
     */
    public function test_update_product_option()
    {
        $productOption = ProductOption::factory()->create();
        $editedProductOption = ProductOption::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/product-options/'.$productOption->id,
            $editedProductOption
        );

        $this->assertApiResponse($editedProductOption);
    }

    /**
     * @test
     */
    public function test_delete_product_option()
    {
        $productOption = ProductOption::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/product-options/'.$productOption->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/product-options/'.$productOption->id
        );

        $this->response->assertStatus(404);
    }
}
