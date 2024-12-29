<?php

namespace Database\Factories;

use App\Models\ProductOption;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Option;
use App\Models\Product;

class ProductOptionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductOption::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        $product = Product::first();
        if (!$product) {
            $product = Product::factory()->create();
        }

        return [
            'product_id' => $this->faker->word,
            'option_id' => $this->faker->word,
            'sku' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'option_value' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'unit_price' => $this->faker->numberBetween(0, 9223372036854775807),
            'stock' => $this->faker->numberBetween(0, 9223372036854775807),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
