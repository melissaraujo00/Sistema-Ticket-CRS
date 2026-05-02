<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buscar las áreas existentes
        $areaAdministrativa = Area::where('name', 'Administrativa')->first();
        $areaSoporte = Area::where('name', 'Soporte Técnico')->first();
        $areaSistemas = Area::where('name', 'Sistemas')->first();

        // 2. Crear los departamentos vinculados
        if ($areaAdministrativa) {
            Department::firstOrCreate([
                'name' => 'Administración',
                'description' => 'Departamento de administración general',
                'email_department' => 'admin@empresa.com',
                'area_id' => $areaAdministrativa->id,
            ]);
        }

        if ($areaSoporte) {
            Department::firstOrCreate([
                'name' => 'Soporte Técnico',
                'description' => 'Departamento de soporte técnico a usuarios',
                'email_department' => 'soporte@empresa.com',
                'area_id' => $areaSoporte->id
            ]);
        }

        if ($areaSistemas) {
            Department::firstOrCreate([
                'name' => 'Desarrollo de Sistemas',
                'description' => 'Departamento de desarrollo de software',
                'email_department' => 'sistemas@empresa.com',
                'area_id' => $areaSistemas->id
            ]);
        }
    }
}
