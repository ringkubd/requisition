<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\ProductIssue;

class ProductIssueApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_product_issue()
    {
        $productIssue = ProductIssue::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/product-issues', $productIssue
        );

        $this->assertApiResponse($productIssue);
    }

    /**
     * @test
     */
    public function test_read_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/product-issues/'.$productIssue->id
        );

        $this->assertApiResponse($productIssue->toArray());
    }

    /**
     * @test
     */
    public function test_update_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();
        $editedProductIssue = ProductIssue::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/product-issues/'.$productIssue->id,
            $editedProductIssue
        );

        $this->assertApiResponse($editedProductIssue);
    }

    /**
     * @test
     */
    public function test_delete_product_issue()
    {
        $productIssue = ProductIssue::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/product-issues/'.$productIssue->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/product-issues/'.$productIssue->id
        );

        $this->response->assertStatus(404);
    }
}
