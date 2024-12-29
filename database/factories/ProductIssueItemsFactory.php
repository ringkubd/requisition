<?php

namespace Database\Factories;

use App\Models\ProductIssueItems;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Category;
use App\Models\ProductOption;
use App\Models\ProductIssue;
use App\Models\Product;

class ProductIssueItemsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductIssueItems::class;

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
            'product_issue_id' => $this->faker->word,
            'product_id' => $this->faker->word,
            'product_option_id' => $this->faker->word,
            'use_in_category' => $this->faker->word,
            'quantity' => $this->faker->numberBetween(0, 9223372036854775807),
            'balance_before_issue' => $this->faker->numberBetween(0, 9223372036854775807),
            'balance_after_issue' => $this->faker->numberBetween(0, 9223372036854775807),
            'purpose' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'uses_area' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'note' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
