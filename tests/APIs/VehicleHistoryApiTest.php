<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\VehicleHistory;

class VehicleHistoryApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/vehicle-histories', $vehicleHistory
        );

        $this->assertApiResponse($vehicleHistory);
    }

    /**
     * @test
     */
    public function test_read_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/vehicle-histories/'.$vehicleHistory->id
        );

        $this->assertApiResponse($vehicleHistory->toArray());
    }

    /**
     * @test
     */
    public function test_update_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();
        $editedVehicleHistory = VehicleHistory::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/vehicle-histories/'.$vehicleHistory->id,
            $editedVehicleHistory
        );

        $this->assertApiResponse($editedVehicleHistory);
    }

    /**
     * @test
     */
    public function test_delete_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/vehicle-histories/'.$vehicleHistory->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/vehicle-histories/'.$vehicleHistory->id
        );

        $this->response->assertStatus(404);
    }
}
