<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\knowledge;
use Faker\Factory;

/**
 * @extends Factory<Knowledge>
 */
class KnowledgeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->unique()->sentence(3),
            'content_response' => $this->faker->paragraph(2, true),
            'creation_date' => $this->faker->date(),
            'category_id' => Category::factory(),
        ];
    }
}
