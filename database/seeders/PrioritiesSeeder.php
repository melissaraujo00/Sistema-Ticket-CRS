<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Priority;

class PrioritiesSeeder extends Seeder
{
    public function run(): void
    {
        $priorities = [
            [
                'name'  => 'Baja',
                'color' => '#28a745',
                'level' => 1,
            ],
            [
                'name'  => 'Media',
                'color' => '#ffc107', // amarillo
                'level' => 2,
            ],
            [
                'name'  => 'Alta',
                'color' => '#fd7e14', // naranja
                'level' => 3,
            ],
            [
                'name'  => 'Urgente',
                'color' => '#dc3545', // rojo
                'level' => 4,
            ],
        ];

        foreach ($priorities as $priority) {
            Priority::firstOrCreate(
                ['level' => $priority['level']], 
                [                               
                    'name'  => $priority['name'],
                    'color' => $priority['color']
                ]
            );
        }
    }
}
