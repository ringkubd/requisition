<?php

namespace Database\Factories;

use App\Models\ProductIssue;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\PurchaseRequisition;
use App\Models\User;

class ProductIssueFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductIssue::class;

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
            'purchase_requisition_id' => $this->faker->word,
            'product_id' => $this->faker->word,
            'product_option_id' => $this->faker->word,
            'quantity' => $this->faker->numberBetween(0, 9223372036854775807),
            'receiver_id' => $this->faker->word,
            'issuer_id' => $this->faker->word,
            'issue_time' => $this->faker->date('Y-m-d H:i:s'),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
