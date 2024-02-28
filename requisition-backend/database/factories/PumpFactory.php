<?php

namespace Database\Factories;

use App\Models\Pump;
use Illuminate\Database\Eloquent\Factories\Factory;


class PumpFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Pump::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        return [
            'name' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'contact_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'address' => $this->faker->text($this->faker->numberBetween(5, 500)),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
