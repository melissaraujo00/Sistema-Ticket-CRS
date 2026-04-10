<?php

namespace Database\Seeders;


use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Lista de permisos
        $permissions = [
            'crear prioridad',
            'editar prioridad',
            'eliminar prioridad',
            'crear plan_sla',
            'editar plan_sla',
            'eliminar plan_sla',
            'ver dashboard',
            'gestionar usuarios',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole->syncPermissions(Permission::all());

        $user = User::find(1);
        if ($user) {
            $user->assignRole($adminRole);
        }
    }
}
