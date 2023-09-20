<?php

namespace Database\Factories;

use App\Models\Products;
use Illuminate\Database\Eloquent\Factories\Factory;


class ProductsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Products::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        return [
            'title' => $this->faker->text($this->faker->numberBetween(5, 4096)),
            'sl_no' => $this->faker->text($this->faker->numberBetween(5, 4096)),
            'unit' => $this->faker->text($this->faker->numberBetween(5, 4096)),
            'category_id' => $this->faker->numberBetween(0, 999),
            'description' => $this->faker->text($this->faker->numberBetween(5, 4096)),
            'status' => $this->faker->randomElement([]),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
