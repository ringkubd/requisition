<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\PurchaseRequisition;

class PurchaseRequisitionApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/purchase-requisitions', $purchaseRequisition
        );

        $this->assertApiResponse($purchaseRequisition);
    }

    /**
     * @test
     */
    public function test_read_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/purchase-requisitions/'.$purchaseRequisition->id
        );

        $this->assertApiResponse($purchaseRequisition->toArray());
    }

    /**
     * @test
     */
    public function test_update_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();
        $editedPurchaseRequisition = PurchaseRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/purchase-requisitions/'.$purchaseRequisition->id,
            $editedPurchaseRequisition
        );

        $this->assertApiResponse($editedPurchaseRequisition);
    }

    /**
     * @test
     */
    public function test_delete_purchase_requisition()
    {
        $purchaseRequisition = PurchaseRequisition::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/purchase-requisitions/'.$purchaseRequisition->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/purchase-requisitions/'.$purchaseRequisition->id
        );

        $this->response->assertStatus(404);
    }
}
