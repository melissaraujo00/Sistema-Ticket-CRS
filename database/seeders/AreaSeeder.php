<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        Area::firstOrCreate([
            'name' => 'Administrativa',
            'description' => 'Área encargada de la gestión administrativa',
        ]);

        Area::firstOrCreate([
            'name' => 'Soporte Técnico',
            'description' => 'Área encargada del soporte técnico y mantenimiento de sistemas'
        ]);

        Area::firstOrCreate([
            'name' => 'Sistemas',
            'description' => 'Área de desarrollo y administración de sistemas'
        ]);
    }
}
