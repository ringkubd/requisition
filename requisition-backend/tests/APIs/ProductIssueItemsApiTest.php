<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\ProductIssueItems;

class ProductIssueItemsApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/product-issue-items', $productIssueItems
        );

        $this->assertApiResponse($productIssueItems);
    }

    /**
     * @test
     */
    public function test_read_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/product-issue-items/'.$productIssueItems->id
        );

        $this->assertApiResponse($productIssueItems->toArray());
    }

    /**
     * @test
     */
    public function test_update_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();
        $editedProductIssueItems = ProductIssueItems::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/product-issue-items/'.$productIssueItems->id,
            $editedProductIssueItems
        );

        $this->assertApiResponse($editedProductIssueItems);
    }

    /**
     * @test
     */
    public function test_delete_product_issue_items()
    {
        $productIssueItems = ProductIssueItems::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/product-issue-items/'.$productIssueItems->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/product-issue-items/'.$productIssueItems->id
        );

        $this->response->assertStatus(404);
    }
}
