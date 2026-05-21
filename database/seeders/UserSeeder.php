<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buscamos los departamentos necesarios
        $deptAdmin = Department::where('name', 'Administración')->first();
        $deptSoporte = Department::where('name', 'Soporte Técnico')->first();
        $deptSistemas = Department::where('name', 'Desarrollo de Sistemas')->first();

        // 2. Definimos todos los usuarios con sus campos obligatorios
        $userData = [
            // Super Administrador
            [
                'email' => 'admin@cruzroja.com',
                'name' => 'Super Administrador',
                'institution_code' => 'CRS-001',
                'dept_id' => $deptAdmin->id,
                'pass' => '123',
                'phone' => '00000000',
                'birth' => '1990-01-01'
            ],

            // Administradores de Área
            [
                'email' => 'admin.soporte@cruzroja.com',
                'name' => 'Admin Soporte Técnico',
                'institution_code' => 'CRS-002',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '11111111',
                'birth' => '1980-05-10'
            ],
            [
                'email' => 'admin.sistemas@cruzroja.com',
                'name' => 'Admin Sistemas',
                'institution_code' => 'CRS-003',
                'dept_id' => $deptSistemas->id,
                'pass' => '123456',
                'phone' => '22222222',
                'birth' => '1982-03-15'
            ],

            // Agentes Técnicos
            [
                'email' => 'carlos.soporte@cruzroja.com',
                'name' => 'Carlos Rodríguez',
                'institution_code' => 'CRS-004',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '55555555',
                'birth' => '1985-05-15'
            ],
            [
                'email' => 'maria.sistemas@cruzroja.com',
                'name' => 'María González',
                'institution_code' => 'CRS-005',
                'dept_id' => $deptSistemas->id,
                'pass' => '123456',
                'phone' => '66666666',
                'birth' => '1990-08-20'
            ],

            // Usuarios Solicitantes
            [
                'email' => 'juan.soporte@cruzroja.com',
                'name' => 'Juan Pérez',
                'institution_code' => 'CRS-006',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '77777777',
                'birth' => '1988-03-10'
            ],
            [
                'email' => 'ana.sistemas@cruzroja.com',
                'name' => 'Ana Martínez',
                'institution_code' => 'CRS-007',
                'dept_id' => $deptSistemas->id,
                'pass' => '123456',
                'phone' => '88888888',
                'birth' => '1992-11-25'
            ],
        ];

        foreach ($userData as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'institution_code' => $user['institution_code'],
                    'password' => Hash::make($user['pass']),
                    'department_id' => $user['dept_id'],
                    'phone_number' => $user['phone'],
                    'birthdate' => $user['birth'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
