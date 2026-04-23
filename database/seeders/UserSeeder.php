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
                'email' => 'admin@admin.com',
                'name' => 'Super Administrador',
                'dept_id' => $deptAdmin->id,
                'pass' => '123',
                'phone' => '00000000',
                'birth' => '1990-01-01'
            ],

            // Administradores de Área
            [
                'email' => 'admin.soporte@empresa.com',
                'name' => 'Admin Soporte Técnico',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '11111111',
                'birth' => '1980-05-10'
            ],
            [
                'email' => 'admin.sistemas@empresa.com',
                'name' => 'Admin Sistemas',
                'dept_id' => $deptSistemas->id,
                'pass' => '123456',
                'phone' => '22222222',
                'birth' => '1982-03-15'
            ],

            // Agentes Técnicos
            [
                'email' => 'tecnico1@empresa.com',
                'name' => 'Carlos Rodríguez',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '55555555',
                'birth' => '1985-05-15'
            ],
            [
                'email' => 'tecnico2@empresa.com',
                'name' => 'María González',
                'dept_id' => $deptSistemas->id,
                'pass' => '123456',
                'phone' => '66666666',
                'birth' => '1990-08-20'
            ],

            // Usuarios Solicitantes
            [
                'email' => 'juan.perez@empresa.com',
                'name' => 'Juan Pérez',
                'dept_id' => $deptSoporte->id,
                'pass' => '123456',
                'phone' => '77777777',
                'birth' => '1988-03-10'
            ],
            [
                'email' => 'ana.martinez@empresa.com',
                'name' => 'Ana Martínez',
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
                    'password' => Hash::make($user['pass']),
                    'department_id' => $user['dept_id'],
                    'phone_number' => $user['phone'],
                    'birthdate' => $user['birth'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('Acceso de Usuarios Creados:');

        $headers = ['Nombre', 'Correo Electrónico', 'Contraseña'];
        $rows = array_map(fn($user) => [
            $user['name'],
            $user['email'],
            $user['pass']
        ], $userData);

        $this->command->table($headers, $rows);

        $this->command->line("");
    }
}
