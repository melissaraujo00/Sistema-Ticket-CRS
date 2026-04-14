<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        Area::create([
            'name' => 'Administrativa',
            'description' => 'Área encargada de la gestión administrativa',
        ]);
    }
}
