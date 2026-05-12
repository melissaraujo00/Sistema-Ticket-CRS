<?php

namespace Database\Seeders;

use App\Models\HelpTopic;
use Illuminate\Database\Seeder;

class HelpTopicSeeder extends Seeder
{
    public function run(): void
    {
        $helpTopics = [
            [
                'name_topic' => 'Hardware',
                'division_id' => 1,
                'sla_plan_id' => 1,
                'knowledge_id' => 3,
                'priority_id' => 2,
            ],
            [
                'name_topic' => 'Software',
                'division_id' => 2,
                'sla_plan_id' => 2,
                'knowledge_id' => 5,
                'priority_id' => 3,
            ],
            [
                'name_topic' => 'Red',
                'division_id' => 3,
                'sla_plan_id' => 2,
                'knowledge_id' => 6,
                'priority_id' => 4,
            ],
        ];

        foreach ($helpTopics as $topic) {
            HelpTopic::firstOrCreate(
                ['name_topic' => $topic['name_topic']],
                $topic
            );
        }
    }
}
