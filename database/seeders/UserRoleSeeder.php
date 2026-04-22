<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Asignar Super Admin
        User::where('email', 'admin@admin.com')->first()?->syncRoles(['superadmin']);

        // Asignar Administradores de Área
        User::whereIn('email', ['admin.soporte@empresa.com', 'admin.sistemas@empresa.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['admin']));

        // Asignar Agentes (Técnicos)
        User::whereIn('email', ['tecnico1@empresa.com', 'tecnico2@empresa.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['agent']));

        // Asignar Usuarios Solicitantes
        User::whereIn('email', ['juan.perez@empresa.com', 'ana.martinez@empresa.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['user']));

    }
}
