<?php

namespace Database\Factories;

use App\Models\VehicleHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Vehicle;
use App\Models\User;
use App\Models\Pump;
use App\Models\CashRequisition;

class VehicleHistoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = VehicleHistory::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        $cashRequisition = CashRequisition::first();
        if (!$cashRequisition) {
            $cashRequisition = CashRequisition::factory()->create();
        }

        return [
            'vehicle_id' => $this->faker->word,
            'cash_requisition_id' => $this->faker->word,
            'refuel_date' => $this->faker->date('Y-m-d'),
            'unit' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'quantity' => $this->faker->numberBetween(0, 9223372036854775807),
            'rate' => $this->faker->numberBetween(0, 9223372036854775807),
            'bill_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'last_mileage' => $this->faker->numberBetween(0, 9223372036854775807),
            'current_mileage' => $this->faker->numberBetween(0, 9223372036854775807),
            'pump_id' => $this->faker->word,
            'user_id' => $this->faker->word,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
