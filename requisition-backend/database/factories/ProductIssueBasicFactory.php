<?php

namespace Database\Factories;

use App\Models\ProductIssueBasic;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;
use App\Models\User;
use App\Models\Department;
use App\Models\Branch;
use App\Models\User;
use App\Models\Department;
use App\Models\Branch;
use App\Models\User;

class ProductIssueBasicFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductIssueBasic::class;

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
            'uuid' => $this->faker->text($this->faker->numberBetween(5, 36)),
            'receiver_id' => $this->faker->word,
            'receiver_branch_id' => $this->faker->word,
            'receiver_department_id' => $this->faker->word,
            'issuer_id' => $this->faker->word,
            'issuer_branch_id' => $this->faker->word,
            'issuer_department_id' => $this->faker->word,
            'number_of_item' => $this->faker->word,
            'issue_time' => $this->faker->date('Y-m-d H:i:s'),
            'department_status' => $this->faker->boolean,
            'department_approved_by' => $this->faker->word,
            'store_status' => $this->faker->boolean,
            'store_approved_by' => $this->faker->word,
            'deleted_at' => $this->faker->date('Y-m-d H:i:s'),
            'created_at' => $this->faker->date('Y-m-d H:i:s'),
            'updated_at' => $this->faker->date('Y-m-d H:i:s')
        ];
    }
}
