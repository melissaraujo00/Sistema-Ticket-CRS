<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class DepartmentHeadSeeder extends Seeder
{
    public function run(): void
    {
        // Mapeo de email de usuario administrador -> nombre del departamento que lidera
        $heads = [
            'admin.soporte@empresa.com'   => 'Soporte',
            'admin.sistemas@empresa.com'  => 'Sistemas',
            // Si el superadmin también debe ser jefe de algún departamento
            'admin@admin.com'             => 'Administración',
        ];

        foreach ($heads as $email => $departmentName) {
            $user = User::where('email', $email)->first();
            $department = Department::where('name', $departmentName)->first();

            if ($user && $department) {
                // Evita duplicados y asigna el rol 'head' en la tabla pivote
                $department->heads()->syncWithoutDetaching([$user->id => ['role' => 'head']]);
            }
        }
    }
}
