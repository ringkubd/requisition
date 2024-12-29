<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Pump;

class PumpApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_pump()
    {
        $pump = Pump::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/pumps', $pump
        );

        $this->assertApiResponse($pump);
    }

    /**
     * @test
     */
    public function test_read_pump()
    {
        $pump = Pump::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/pumps/'.$pump->id
        );

        $this->assertApiResponse($pump->toArray());
    }

    /**
     * @test
     */
    public function test_update_pump()
    {
        $pump = Pump::factory()->create();
        $editedPump = Pump::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/pumps/'.$pump->id,
            $editedPump
        );

        $this->assertApiResponse($editedPump);
    }

    /**
     * @test
     */
    public function test_delete_pump()
    {
        $pump = Pump::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/pumps/'.$pump->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/pumps/'.$pump->id
        );

        $this->response->assertStatus(404);
    }
}
