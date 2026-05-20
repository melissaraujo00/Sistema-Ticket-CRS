<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Asignar Super Admin
        User::where('email', 'admin@cruzroja.com')->first()?->syncRoles(['superadmin']);

        // Asignar Administradores de Área
        User::whereIn('email', ['admin.soporte@cruzroja.com', 'admin.sistemas@cruzroja.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['admin']));

        // Asignar Agentes (Técnicos)
        User::whereIn('email', ['carlos.soporte@cruzroja.com', 'maria.sistemas@cruzroja.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['agent']));

        // Asignar Usuarios Solicitantes
        User::whereIn('email', ['juan.soporte@cruzroja.com', 'ana.sistemas@cruzroja.com'])
            ->get()
            ->each(fn($user) => $user->syncRoles(['user']));
    }
}
