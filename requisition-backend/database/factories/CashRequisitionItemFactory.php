<?php

namespace Database\Factories;

use App\Models\CashRequisitionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\CashRequisition;

class CashRequisitionItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CashRequisitionItem::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $cashRequisition = CashRequisition::first();
        if (!$cashRequisition) {
            $cashRequisition = CashRequisition::factory()->create();
        }

        return [
            'cash_requisition_id' => $this->faker->word,
            'item' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'unit' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'required_unit' => $this->faker->numberBetween(0, 9223372036854775807),
            'unit_price' => $this->faker->numberBetween(0, 9223372036854775807),
            'purpose' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
