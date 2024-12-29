<?php

namespace Tests\Repositories;

use App\Models\VehicleHistory;
use App\Repositories\VehicleHistoryRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class VehicleHistoryRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected VehicleHistoryRepository $vehicleHistoryRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->vehicleHistoryRepo = app(VehicleHistoryRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->make()->toArray();

        $createdVehicleHistory = $this->vehicleHistoryRepo->create($vehicleHistory);

        $createdVehicleHistory = $createdVehicleHistory->toArray();
        $this->assertArrayHasKey('id', $createdVehicleHistory);
        $this->assertNotNull($createdVehicleHistory['id'], 'Created VehicleHistory must have id specified');
        $this->assertNotNull(VehicleHistory::find($createdVehicleHistory['id']), 'VehicleHistory with given id must be in DB');
        $this->assertModelData($vehicleHistory, $createdVehicleHistory);
    }

    /**
     * @test read
     */
    public function test_read_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();

        $dbVehicleHistory = $this->vehicleHistoryRepo->find($vehicleHistory->id);

        $dbVehicleHistory = $dbVehicleHistory->toArray();
        $this->assertModelData($vehicleHistory->toArray(), $dbVehicleHistory);
    }

    /**
     * @test update
     */
    public function test_update_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();
        $fakeVehicleHistory = VehicleHistory::factory()->make()->toArray();

        $updatedVehicleHistory = $this->vehicleHistoryRepo->update($fakeVehicleHistory, $vehicleHistory->id);

        $this->assertModelData($fakeVehicleHistory, $updatedVehicleHistory->toArray());
        $dbVehicleHistory = $this->vehicleHistoryRepo->find($vehicleHistory->id);
        $this->assertModelData($fakeVehicleHistory, $dbVehicleHistory->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_vehicle_history()
    {
        $vehicleHistory = VehicleHistory::factory()->create();

        $resp = $this->vehicleHistoryRepo->delete($vehicleHistory->id);

        $this->assertTrue($resp);
        $this->assertNull(VehicleHistory::find($vehicleHistory->id), 'VehicleHistory should not exist in DB');
    }
}
