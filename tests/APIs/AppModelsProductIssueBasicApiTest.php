<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\AppModelsProductIssueBasic;

class AppModelsProductIssueBasicApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/app-models-product-issue-basics', $appModelsProductIssueBasic
        );

        $this->assertApiResponse($appModelsProductIssueBasic);
    }

    /**
     * @test
     */
    public function test_read_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/app-models-product-issue-basics/'.$appModelsProductIssueBasic->id
        );

        $this->assertApiResponse($appModelsProductIssueBasic->toArray());
    }

    /**
     * @test
     */
    public function test_update_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();
        $editedAppModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/app-models-product-issue-basics/'.$appModelsProductIssueBasic->id,
            $editedAppModelsProductIssueBasic
        );

        $this->assertApiResponse($editedAppModelsProductIssueBasic);
    }

    /**
     * @test
     */
    public function test_delete_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/app-models-product-issue-basics/'.$appModelsProductIssueBasic->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/app-models-product-issue-basics/'.$appModelsProductIssueBasic->id
        );

        $this->response->assertStatus(404);
    }
}
