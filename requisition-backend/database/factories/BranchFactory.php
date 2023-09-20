<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\Organization;

class BranchFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Branch::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $organization = Organization::first();
        if (!$organization) {
            $organization = Organization::factory()->create();
        }

        return [
            'organization_id' => $this->faker->word,
            'name' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'email' => $this->faker->email,
            'contact_no' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'address' => $this->faker->text($this->faker->numberBetween(5, 255)),
            'location' => $this->faker->text($this->faker->numberBetween(5, 4096)),
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
