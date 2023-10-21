<?php

namespace Tests\Repositories;

use App\Models\Supplier;
use App\Repositories\SupplierRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Tests\ApiTestTrait;

class SupplierRepositoryTest extends TestCase
{
    use ApiTestTrait, DatabaseTransactions;

    protected SupplierRepository $supplierRepo;

    public function setUp() : void
    {
        parent::setUp();
        $this->supplierRepo = app(SupplierRepository::class);
    }

    /**
     * @test create
     */
    public function test_create_supplier()
    {
        $supplier = Supplier::factory()->make()->toArray();

        $createdSupplier = $this->supplierRepo->create($supplier);

        $createdSupplier = $createdSupplier->toArray();
        $this->assertArrayHasKey('id', $createdSupplier);
        $this->assertNotNull($createdSupplier['id'], 'Created Supplier must have id specified');
        $this->assertNotNull(Supplier::find($createdSupplier['id']), 'Supplier with given id must be in DB');
        $this->assertModelData($supplier, $createdSupplier);
    }

    /**
     * @test read
     */
    public function test_read_supplier()
    {
        $supplier = Supplier::factory()->create();

        $dbSupplier = $this->supplierRepo->find($supplier->id);

        $dbSupplier = $dbSupplier->toArray();
        $this->assertModelData($supplier->toArray(), $dbSupplier);
    }

    /**
     * @test update
     */
    public function test_update_supplier()
    {
        $supplier = Supplier::factory()->create();
        $fakeSupplier = Supplier::factory()->make()->toArray();

        $updatedSupplier = $this->supplierRepo->update($fakeSupplier, $supplier->id);

        $this->assertModelData($fakeSupplier, $updatedSupplier->toArray());
        $dbSupplier = $this->supplierRepo->find($supplier->id);
        $this->assertModelData($fakeSupplier, $dbSupplier->toArray());
    }

    /**
     * @test delete
     */
    public function test_delete_supplier()
    {
        $supplier = Supplier::factory()->create();

        $resp = $this->supplierRepo->delete($supplier->id);

        $this->assertTrue($resp);
        $this->assertNull(Supplier::find($supplier->id), 'Supplier should not exist in DB');
    }
}
