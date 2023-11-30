<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\CashProduct;

class CashProductApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_cash_product()
    {
        $cashProduct = CashProduct::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/cash-products', $cashProduct
        );

        $this->assertApiResponse($cashProduct);
    }

    /**
     * @test
     */
    public function test_read_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/cash-products/'.$cashProduct->id
        );

        $this->assertApiResponse($cashProduct->toArray());
    }

    /**
     * @test
     */
    public function test_update_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();
        $editedCashProduct = CashProduct::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/cash-products/'.$cashProduct->id,
            $editedCashProduct
        );

        $this->assertApiResponse($editedCashProduct);
    }

    /**
     * @test
     */
    public function test_delete_cash_product()
    {
        $cashProduct = CashProduct::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/cash-products/'.$cashProduct->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/cash-products/'.$cashProduct->id
        );

        $this->response->assertStatus(404);
    }
}
