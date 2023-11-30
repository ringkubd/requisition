<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\CashRequisition;

class CashRequisitionApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/cash-requisitions', $cashRequisition
        );

        $this->assertApiResponse($cashRequisition);
    }

    /**
     * @test
     */
    public function test_read_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/cash-requisitions/'.$cashRequisition->id
        );

        $this->assertApiResponse($cashRequisition->toArray());
    }

    /**
     * @test
     */
    public function test_update_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();
        $editedCashRequisition = CashRequisition::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/cash-requisitions/'.$cashRequisition->id,
            $editedCashRequisition
        );

        $this->assertApiResponse($editedCashRequisition);
    }

    /**
     * @test
     */
    public function test_delete_cash_requisition()
    {
        $cashRequisition = CashRequisition::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/cash-requisitions/'.$cashRequisition->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/cash-requisitions/'.$cashRequisition->id
        );

        $this->response->assertStatus(404);
    }
}
