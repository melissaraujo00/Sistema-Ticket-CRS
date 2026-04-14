<?php

namespace Database\Factories;

use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\knowledge;
use App\Models\Priority;
use App\Models\SlaPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HelpTopic>
 */
class HelpTopicFactory extends Factory
{
    /**
     * Define the model's defult state
     *
     * @Return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name_topic' => $this->faker->unique()->word(),
            'division_id'=> Division::factory(),
            'sla_plan_id' => SlaPlan::factory(),
            'knowledge_id' => Knowledge::factory(),
            'priority_id' => Priority::factory(),
        ];
    }
}
