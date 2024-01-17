<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\ProductIssueBasic;

class ProductIssueBasicApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/product-issue-basics', $productIssueBasic
        );

        $this->assertApiResponse($productIssueBasic);
    }

    /**
     * @test
     */
    public function test_read_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/product-issue-basics/'.$productIssueBasic->id
        );

        $this->assertApiResponse($productIssueBasic->toArray());
    }

    /**
     * @test
     */
    public function test_update_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();
        $editedProductIssueBasic = ProductIssueBasic::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/product-issue-basics/'.$productIssueBasic->id,
            $editedProductIssueBasic
        );

        $this->assertApiResponse($editedProductIssueBasic);
    }

    /**
     * @test
     */
    public function test_delete_product_issue_basic()
    {
        $productIssueBasic = ProductIssueBasic::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/product-issue-basics/'.$productIssueBasic->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/product-issue-basics/'.$productIssueBasic->id
        );

        $this->response->assertStatus(404);
    }
}
