<?php

namespace Database\Factories;

use App\Models\InitialRequisition;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;
use App\Models\Department;

class InitialRequisitionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = InitialRequisition::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        $department = Department::first();
        if (!$department) {
            $department = Department::factory()->create();
        }

        return [
            'user_id' => $this->faker->word,
            'department_id' => $this->faker->word,
            'irf_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'ir_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'estimated_cost' => $this->faker->numberBetween(0, 9223372036854775807),
            'is_purchase_requisition_generated' => $this->faker->boolean,
            'is_purchase_done' => $this->faker->boolean,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
