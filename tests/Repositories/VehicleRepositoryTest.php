<?php

namespace Tests\Repositories;

use App\Models\Vehicle;
use App\Repositories\VehicleRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class VehicleRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected VehicleRepository $vehicleRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->vehicleRepo = app(VehicleRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_vehicle()
    {
        $vehicle = Vehicle::factory()->make()->toArray();

        $createdVehicle = $this->vehicleRepo->create($vehicle);

        $createdVehicle = $createdVehicle->toArray();
        $this->assertArrayHasKey('id', $createdVehicle);
        $this->assertNotNull($createdVehicle['id'], 'Created Vehicle must have id specified');
        $this->assertNotNull(Vehicle::find($createdVehicle['id']), 'Vehicle with given id must be in DB');
        $this->assertModelData($vehicle, $createdVehicle);
    }

    /**
     * @test read
     */
    public function test_read_vehicle()
    {
        $vehicle = Vehicle::factory()->create();

        $dbVehicle = $this->vehicleRepo->find($vehicle->id);

        $dbVehicle = $dbVehicle->toArray();
        $this->assertModelData($vehicle->toArray(), $dbVehicle);
    }

    /**
     * @test update
     */
    public function test_update_vehicle()
    {
        $vehicle = Vehicle::factory()->create();
        $fakeVehicle = Vehicle::factory()->make()->toArray();

        $updatedVehicle = $this->vehicleRepo->update($fakeVehicle, $vehicle->id);

        $this->assertModelData($fakeVehicle, $updatedVehicle->toArray());
        $dbVehicle = $this->vehicleRepo->find($vehicle->id);
        $this->assertModelData($fakeVehicle, $dbVehicle->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_vehicle()
    {
        $vehicle = Vehicle::factory()->create();

        $resp = $this->vehicleRepo->delete($vehicle->id);

        $this->assertTrue($resp);
        $this->assertNull(Vehicle::find($vehicle->id), 'Vehicle should not exist in DB');
    }
}
