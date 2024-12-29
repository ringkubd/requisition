<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\MeasurementUnit;

class MeasurementUnitApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/measurement-units', $measurementUnit
        );

        $this->assertApiResponse($measurementUnit);
    }

    /**
     * @test
     */
    public function test_read_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/measurement-units/'.$measurementUnit->id
        );

        $this->assertApiResponse($measurementUnit->toArray());
    }

    /**
     * @test
     */
    public function test_update_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();
        $editedMeasurementUnit = MeasurementUnit::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/measurement-units/'.$measurementUnit->id,
            $editedMeasurementUnit
        );

        $this->assertApiResponse($editedMeasurementUnit);
    }

    /**
     * @test
     */
    public function test_delete_measurement_unit()
    {
        $measurementUnit = MeasurementUnit::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/measurement-units/'.$measurementUnit->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/measurement-units/'.$measurementUnit->id
        );

        $this->response->assertStatus(404);
    }
}
