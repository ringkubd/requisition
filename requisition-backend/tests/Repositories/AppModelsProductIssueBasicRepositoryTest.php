<?php

namespace Tests\Repositories;

use App\Models\AppModelsProductIssueBasic;
use App\Repositories\AppModelsProductIssueBasicRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class AppModelsProductIssueBasicRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected AppModelsProductIssueBasicRepository $appModelsProductIssueBasicRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->appModelsProductIssueBasicRepo = app(AppModelsProductIssueBasicRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->make()->toArray();

        $createdAppModelsProductIssueBasic = $this->appModelsProductIssueBasicRepo->create($appModelsProductIssueBasic);

        $createdAppModelsProductIssueBasic = $createdAppModelsProductIssueBasic->toArray();
        $this->assertArrayHasKey('id', $createdAppModelsProductIssueBasic);
        $this->assertNotNull($createdAppModelsProductIssueBasic['id'], 'Created AppModelsProductIssueBasic must have id specified');
        $this->assertNotNull(AppModelsProductIssueBasic::find($createdAppModelsProductIssueBasic['id']), 'AppModelsProductIssueBasic with given id must be in DB');
        $this->assertModelData($appModelsProductIssueBasic, $createdAppModelsProductIssueBasic);
    }

    /**
     * @test read
     */
    public function test_read_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();

        $dbAppModelsProductIssueBasic = $this->appModelsProductIssueBasicRepo->find($appModelsProductIssueBasic->id);

        $dbAppModelsProductIssueBasic = $dbAppModelsProductIssueBasic->toArray();
        $this->assertModelData($appModelsProductIssueBasic->toArray(), $dbAppModelsProductIssueBasic);
    }

    /**
     * @test update
     */
    public function test_update_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();
        $fakeAppModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->make()->toArray();

        $updatedAppModelsProductIssueBasic = $this->appModelsProductIssueBasicRepo->update($fakeAppModelsProductIssueBasic, $appModelsProductIssueBasic->id);

        $this->assertModelData($fakeAppModelsProductIssueBasic, $updatedAppModelsProductIssueBasic->toArray());
        $dbAppModelsProductIssueBasic = $this->appModelsProductIssueBasicRepo->find($appModelsProductIssueBasic->id);
        $this->assertModelData($fakeAppModelsProductIssueBasic, $dbAppModelsProductIssueBasic->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_app_models_product_issue_basic()
    {
        $appModelsProductIssueBasic = AppModelsProductIssueBasic::factory()->create();

        $resp = $this->appModelsProductIssueBasicRepo->delete($appModelsProductIssueBasic->id);

        $this->assertTrue($resp);
        $this->assertNull(AppModelsProductIssueBasic::find($appModelsProductIssueBasic->id), 'AppModelsProductIssueBasic should not exist in DB');
    }
}
