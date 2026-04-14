<?php

namespace Database\Factories;

use App\Models\Category;
use Faker\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(1, true),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }
}
