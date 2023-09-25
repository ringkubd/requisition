<?php

namespace Database\Factories;

use App\Models\PurchaseRequisition;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\InitialRequisition;

class PurchaseRequisitionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PurchaseRequisition::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $initialRequisition = InitialRequisition::first();
        if (!$initialRequisition) {
            $initialRequisition = InitialRequisition::factory()->create();
        }

        return [
            'initial_requisition_id' => $this->faker->word,
            'estimated_total_amount' => $this->faker->numberBetween(0, 9223372036854775807),
            'received_amount' => $this->faker->numberBetween(0, 9223372036854775807),
            'payment_type' => $this->faker->boolean,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
