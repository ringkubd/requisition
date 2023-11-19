<?php

namespace Tests\Repositories;

use App\Models\Country;
use App\Repositories\CountryRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class CountryRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected CountryRepository $countryRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->countryRepo = app(CountryRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_country()
    {
        $country = Country::factory()->make()->toArray();

        $createdCountry = $this->countryRepo->create($country);

        $createdCountry = $createdCountry->toArray();
        $this->assertArrayHasKey('id', $createdCountry);
        $this->assertNotNull($createdCountry['id'], 'Created Country must have id specified');
        $this->assertNotNull(Country::find($createdCountry['id']), 'Country with given id must be in DB');
        $this->assertModelData($country, $createdCountry);
    }

    /**
     * @test read
     */
    public function test_read_country()
    {
        $country = Country::factory()->create();

        $dbCountry = $this->countryRepo->find($country->id);

        $dbCountry = $dbCountry->toArray();
        $this->assertModelData($country->toArray(), $dbCountry);
    }

    /**
     * @test update
     */
    public function test_update_country()
    {
        $country = Country::factory()->create();
        $fakeCountry = Country::factory()->make()->toArray();

        $updatedCountry = $this->countryRepo->update($fakeCountry, $country->id);

        $this->assertModelData($fakeCountry, $updatedCountry->toArray());
        $dbCountry = $this->countryRepo->find($country->id);
        $this->assertModelData($fakeCountry, $dbCountry->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_country()
    {
        $country = Country::factory()->create();

        $resp = $this->countryRepo->delete($country->id);

        $this->assertTrue($resp);
        $this->assertNull(Country::find($country->id), 'Country should not exist in DB');
    }
}
