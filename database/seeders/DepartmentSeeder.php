<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $area = Area::first();

        Department::create([
            'name' => 'Administración',
            'description' => 'Departamento de administración general',
            'email_department' => 'admin@empresa.com',
            'area_id' => $area->id,
        ]);
    }
}
