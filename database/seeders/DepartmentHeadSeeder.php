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
            'admin.soporte@empresa.com'   => 'Administración',
            'admin.sistemas@empresa.com'  => 'Sistemas',
            'admin@admin.com'             => 'Soporte',
        ];

        foreach ($heads as $email => $departmentName) {
            $user = User::where('email', $email)->first();
            $department = Department::where('name', $departmentName)->first(); // ← corregido

            if ($user && $department) {
                $department->heads()->syncWithoutDetaching([$user->id => ['role' => 'head']]);
            }
        }

        // Asignación adicional: usuario con ID 2 como jefe del departamento con ID 2
        $user2 = User::find(2);
        $department2 = Department::find(2);

        if ($user2 && $department2) {
            $department2->heads()->syncWithoutDetaching([$user2->id => ['role' => 'head']]);
        }
    }
}
