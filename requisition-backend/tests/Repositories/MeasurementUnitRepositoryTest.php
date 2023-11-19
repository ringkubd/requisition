<?php

namespace Tests\Repositories;

use App\Models\MeasurementUnit;
use App\Repositories\MeasurementUnitRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class MeasurementUnitRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected MeasurementUnitRepository $measurementUnitRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->measurementUnitRepo = app(MeasurementUnitRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->make()->toArray();

        $createdMeasurementUnit = $this->measurementUnitRepo->create($measurementUnit);

        $createdMeasurementUnit = $createdMeasurementUnit->toArray();
        $this->assertArrayHasKey('id', $createdMeasurementUnit);
        $this->assertNotNull($createdMeasurementUnit['id'], 'Created MeasurementUnit must have id specified');
        $this->assertNotNull(MeasurementUnit::find($createdMeasurementUnit['id']), 'MeasurementUnit with given id must be in DB');
        $this->assertModelData($measurementUnit, $createdMeasurementUnit);
    }

    /**
     * @test read
     */
    public function test_read_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();

        $dbMeasurementUnit = $this->measurementUnitRepo->find($measurementUnit->id);

        $dbMeasurementUnit = $dbMeasurementUnit->toArray();
        $this->assertModelData($measurementUnit->toArray(), $dbMeasurementUnit);
    }

    /**
     * @test update
     */
    public function test_update_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();
        $fakeMeasurementUnit = MeasurementUnit::factory()->make()->toArray();

        $updatedMeasurementUnit = $this->measurementUnitRepo->update($fakeMeasurementUnit, $measurementUnit->id);

        $this->assertModelData($fakeMeasurementUnit, $updatedMeasurementUnit->toArray());
        $dbMeasurementUnit = $this->measurementUnitRepo->find($measurementUnit->id);
        $this->assertModelData($fakeMeasurementUnit, $dbMeasurementUnit->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();

        $resp = $this->measurementUnitRepo->delete($measurementUnit->id);

        $this->assertTrue($resp);
        $this->assertNull(MeasurementUnit::find($measurementUnit->id), 'MeasurementUnit should not exist in DB');
    }
}
