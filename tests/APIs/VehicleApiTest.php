<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Vehicle;

class VehicleApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_vehicle()
    {
        $vehicle = Vehicle::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/vehicles', $vehicle
        );

        $this->assertApiResponse($vehicle);
    }

    /**
     * @test
     */
    public function test_read_vehicle()
    {
        $vehicle = Vehicle::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/vehicles/'.$vehicle->id
        );

        $this->assertApiResponse($vehicle->toArray());
    }

    /**
     * @test
     */
    public function test_update_vehicle()
    {
        $vehicle = Vehicle::factory()->create();
        $editedVehicle = Vehicle::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/vehicles/'.$vehicle->id,
            $editedVehicle
        );

        $this->assertApiResponse($editedVehicle);
    }

    /**
     * @test
     */
    public function test_delete_vehicle()
    {
        $vehicle = Vehicle::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/vehicles/'.$vehicle->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/vehicles/'.$vehicle->id
        );

        $this->response->assertStatus(404);
    }
}
