<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Priority;

class PrioritiesTableSeeder extends Seeder
{
    public function run(): void
    {
        $priorities = [
            [
                'name'  => 'Baja',
                'color' => '#28a745', // verde
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
                'name'  => 'Crítica',
                'color' => '#dc3545', // rojo
                'level' => 4,
            ],
        ];

        foreach ($priorities as $priority) {
            Priority::firstOrCreate(
                ['level' => $priority['level']], // usamos level como identificador único
                $priority
            );
        }
    }
}
