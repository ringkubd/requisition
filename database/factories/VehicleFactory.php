<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\CashProduct;

class VehicleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Vehicle::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $cashProduct = CashProduct::first();
        if (!$cashProduct) {
            $cashProduct = CashProduct::factory()->create();
        }

        return [
            'brand' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'model' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'reg_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'cash_product_id' => $this->faker->word,
            'ownership' => $this->faker->boolean,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
