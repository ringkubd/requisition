<?php

namespace Tests\APIs;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;
use App\Models\Country;

class CountryApiTest extends TestCase
{
    use ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function test_create_country()
    {
        $country = Country::factory()->make()->toArray();

        $this->response = $this->json(
            'POST',
            '/api/countries', $country
        );

        $this->assertApiResponse($country);
    }

    /**
     * @test
     */
    public function test_read_country()
    {
        $country = Country::factory()->create();

        $this->response = $this->json(
            'GET',
            '/api/countries/'.$country->id
        );

        $this->assertApiResponse($country->toArray());
    }

    /**
     * @test
     */
    public function test_update_country()
    {
        $country = Country::factory()->create();
        $editedCountry = Country::factory()->make()->toArray();

        $this->response = $this->json(
            'PUT',
            '/api/countries/'.$country->id,
            $editedCountry
        );

        $this->assertApiResponse($editedCountry);
    }

    /**
     * @test
     */
    public function test_delete_country()
    {
        $country = Country::factory()->create();

        $this->response = $this->json(
            'DELETE',
             '/api/countries/'.$country->id
         );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/countries/'.$country->id
        );

        $this->response->assertStatus(404);
    }
}
