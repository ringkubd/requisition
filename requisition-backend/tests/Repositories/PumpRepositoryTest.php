<?php

namespace Tests\Repositories;

use App\Models\Pump;
use App\Repositories\PumpRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class PumpRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected PumpRepository $pumpRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->pumpRepo = app(PumpRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_pump()
    {
        $pump = Pump::factory()->make()->toArray();

        $createdPump = $this->pumpRepo->create($pump);

        $createdPump = $createdPump->toArray();
        $this->assertArrayHasKey('id', $createdPump);
        $this->assertNotNull($createdPump['id'], 'Created Pump must have id specified');
        $this->assertNotNull(Pump::find($createdPump['id']), 'Pump with given id must be in DB');
        $this->assertModelData($pump, $createdPump);
    }

    /**
     * @test read
     */
    public function test_read_pump()
    {
        $pump = Pump::factory()->create();

        $dbPump = $this->pumpRepo->find($pump->id);

        $dbPump = $dbPump->toArray();
        $this->assertModelData($pump->toArray(), $dbPump);
    }

    /**
     * @test update
     */
    public function test_update_pump()
    {
        $pump = Pump::factory()->create();
        $fakePump = Pump::factory()->make()->toArray();

        $updatedPump = $this->pumpRepo->update($fakePump, $pump->id);

        $this->assertModelData($fakePump, $updatedPump->toArray());
        $dbPump = $this->pumpRepo->find($pump->id);
        $this->assertModelData($fakePump, $dbPump->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_pump()
    {
        $pump = Pump::factory()->create();

        $resp = $this->pumpRepo->delete($pump->id);

        $this->assertTrue($resp);
        $this->assertNull(Pump::find($pump->id), 'Pump should not exist in DB');
    }
}
