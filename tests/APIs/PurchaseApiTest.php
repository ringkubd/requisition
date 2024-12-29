<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Purchase;

class PurchaseApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_purchase()
    {
        $purchase = Purchase::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/purchases', $purchase
        );

        $this->assertApiResponse($purchase);
    }

    /**
     * @test
     */
    public function test_read_purchase()
    {
        $purchase = Purchase::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/purchases/'.$purchase->id
        );

        $this->assertApiResponse($purchase->toArray());
    }

    /**
     * @test
     */
    public function test_update_purchase()
    {
        $purchase = Purchase::factory()->create();
        $editedPurchase = Purchase::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/purchases/'.$purchase->id,
            $editedPurchase
        );

        $this->assertApiResponse($editedPurchase);
    }

    /**
     * @test
     */
    public function test_delete_purchase()
    {
        $purchase = Purchase::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/purchases/'.$purchase->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/purchases/'.$purchase->id
        );

        $this->response->assertStatus(404);
    }
}
