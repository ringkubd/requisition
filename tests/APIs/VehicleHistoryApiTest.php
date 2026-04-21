<?php

namespace Tests\APIs;

use App\Models\Branch;
use App\Models\CashProduct;
use App\Models\CashRequisition;
use App\Models\CashRequisitionItem;
use App\Models\Department;
use App\Models\Organization;
use App\Models\User;
use App\Models\Vehicle;
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
            '/api/vehicle-histories',
            $vehicleHistory
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
            '/api/vehicle-histories/' . $vehicleHistory->id
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
            '/api/vehicle-histories/' . $vehicleHistory->id,
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
            '/api/vehicle-histories/' . $vehicleHistory->id
        );

        $this->assertApiSuccess();
        $this->response = $this->json(
            'GET',
            '/api/vehicle-histories/' . $vehicleHistory->id
        );

        $this->response->assertStatus(404);
    }

    /**
     * @test
     */
    public function test_monthly_report_does_not_count_post_month_refuel_as_monthly_purchase()
    {
        $organization = Organization::query()->create([
            'name' => 'Test Org',
            'email' => 'org@example.com',
        ]);

        $branch = Branch::query()->create([
            'organization_id' => $organization->id,
            'name' => 'Main Branch',
            'email' => 'branch@example.com',
        ]);

        $department = Department::query()->create([
            'organization_id' => $organization->id,
            'branch_id' => $branch->id,
            'name' => 'Operations',
        ]);

        $user = User::query()->create([
            'name' => 'Vehicle Reporter',
            'email' => 'vehicle.reporter@example.com',
            'password' => 'secret',
        ]);

        $cashProduct = CashProduct::query()->create([
            'title' => 'Diesel',
        ]);

        $vehicle = Vehicle::query()->create([
            'brand' => 'Mitsubishi Hard Jeep',
            'model' => 'Nativa',
            'reg_no' => 'DM Gha 11-8044',
            'cash_product_id' => $cashProduct->id,
            'ownership' => false,
        ]);

        $cashRequisition = CashRequisition::query()->create([
            'user_id' => $user->id,
            'branch_id' => $branch->id,
            'department_id' => $department->id,
            'irf_no' => 'IRF-001',
            'ir_no' => 'IR-001',
            'total_cost' => 4000,
        ]);

        $cashRequisitionItem = CashRequisitionItem::query()->create([
            'cash_requisition_id' => $cashRequisition->id,
            'item' => $cashProduct->title,
            'unit' => 'ltr',
            'required_unit' => 40,
            'unit_price' => 100,
            'purpose' => 'Fuel purchase',
        ]);

        VehicleHistory::query()->create([
            'vehicle_id' => $vehicle->id,
            'cash_requisition_id' => $cashRequisition->id,
            'cash_requisition_item_id' => $cashRequisitionItem->id,
            'refuel_date' => '2024-12-05',
            'unit' => 'ltr',
            'quantity' => 40,
            'rate' => 100,
            'bill_no' => 'BILL-001',
            'last_mileage' => 1200,
            'current_mileage' => 1240,
            'user_id' => $user->id,
        ]);

        $this->response = $this->json('GET', '/api/vehicles_monthly_report?month=11-2024');

        $this->response->assertStatus(200);

        $report = collect(json_decode($this->response->getContent(), true)['data'])
            ->firstWhere('vehicle', 'Mitsubishi Hard Jeep (DM Gha 11-8044)');

        $this->assertNotNull($report);
        $this->assertSame('Nov 2024', $report['month']);
        $this->assertSame('0.00', $report['quantity']);
        $this->assertSame(0, $report['cost']);
    }
}
