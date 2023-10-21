<?php

namespace Database\Factories;

use App\Models\Purchase;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\PurchaseRequisition;

class PurchaseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Purchase::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        
        $purchaseRequisition = PurchaseRequisition::first();
        if (!$purchaseRequisition) {
            $purchaseRequisition = PurchaseRequisition::factory()->create();
        }

        return [
            'product_id' => $this->faker->word,
            'supplier_id' => $this->faker->word,
            'purchase_requisition_id' => $this->faker->word,
            'qty' => $this->faker->numberBetween(0, 9223372036854775807),
            'unit_price' => $this->faker->numberBetween(0, 9223372036854775807),
            'total_price' => $this->faker->numberBetween(0, 9223372036854775807),
            'user_id' => $this->faker->word,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
