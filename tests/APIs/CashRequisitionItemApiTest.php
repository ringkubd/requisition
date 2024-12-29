<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\CashRequisitionItem;

class CashRequisitionItemApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/cash-requisition-items', $cashRequisitionItem
        );

        $this->assertApiResponse($cashRequisitionItem);
    }

    /**
     * @test
     */
    public function test_read_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/cash-requisition-items/'.$cashRequisitionItem->id
        );

        $this->assertApiResponse($cashRequisitionItem->toArray());
    }

    /**
     * @test
     */
    public function test_update_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();
        $editedCashRequisitionItem = CashRequisitionItem::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/cash-requisition-items/'.$cashRequisitionItem->id,
            $editedCashRequisitionItem
        );

        $this->assertApiResponse($editedCashRequisitionItem);
    }

    /**
     * @test
     */
    public function test_delete_cash_requisition_item()
    {
        $cashRequisitionItem = CashRequisitionItem::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/cash-requisition-items/'.$cashRequisitionItem->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/cash-requisition-items/'.$cashRequisitionItem->id
        );

        $this->response->assertStatus(404);
    }
}
