<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Designation;

class DesignationApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_designation()
    {
        $designation = Designation::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/designations', $designation
        );

        $this->assertApiResponse($designation);
    }

    /**
     * @test
     */
    public function test_read_designation()
    {
        $designation = Designation::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/designations/'.$designation->id
        );

        $this->assertApiResponse($designation->toArray());
    }

    /**
     * @test
     */
    public function test_update_designation()
    {
        $designation = Designation::factory()->create();
        $editedDesignation = Designation::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/designations/'.$designation->id,
            $editedDesignation
        );

        $this->assertApiResponse($editedDesignation);
    }

    /**
     * @test
     */
    public function test_delete_designation()
    {
        $designation = Designation::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/designations/'.$designation->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/designations/'.$designation->id
        );

        $this->response->assertStatus(404);
    }
}
