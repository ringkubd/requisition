<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\InitialRequisition;

class InitialRequisitionApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/initial-requisitions', $initialRequisition
        );

        $this->assertApiResponse($initialRequisition);
    }

    /**
     * @test
     */
    public function test_read_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/initial-requisitions/'.$initialRequisition->id
        );

        $this->assertApiResponse($initialRequisition->toArray());
    }

    /**
     * @test
     */
    public function test_update_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();
        $editedInitialRequisition = InitialRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/initial-requisitions/'.$initialRequisition->id,
            $editedInitialRequisition
        );

        $this->assertApiResponse($editedInitialRequisition);
    }

    /**
     * @test
     */
    public function test_delete_initial_requisition()
    {
        $initialRequisition = InitialRequisition::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/initial-requisitions/'.$initialRequisition->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/initial-requisitions/'.$initialRequisition->id
        );

        $this->response->assertStatus(404);
    }
}
