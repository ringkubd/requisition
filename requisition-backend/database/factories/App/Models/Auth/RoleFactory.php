<?php

namespace Database\Factories;

use App\Models\App/Models/Auth/Role;
use Illuminate\Database\Eloquent\Factories\Factory;


class App/Models/Auth/RoleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = App/Models/Auth/Role::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        return [
            'name' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'guard_name' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
