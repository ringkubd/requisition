<?php

namespace Database\Factories;

use App\Models\CashRequisition;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Branch;
use App\Models\Department;
use App\Models\User;

class CashRequisitionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CashRequisition::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create();
        }

        return [
            'user_id' => $this->faker->word,
            'branch_id' => $this->faker->word,
            'department_id' => $this->faker->word,
            'irf_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'ir_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'total_cost' => $this->faker->numberBetween(0, 9223372036854775807),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
