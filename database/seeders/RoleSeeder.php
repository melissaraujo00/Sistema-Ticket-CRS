<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage_users', 'manage_roles_permissions', 'manage_catalogs',
            'view_global_dashboard', 'view_audit_logs', 'manage_area_tickets',
            'assign_tickets', 'view_area_dashboard', 'view_assigned_tickets',
            'solve_tickets', 'return_tickets', 'create_tickets',
            'view_own_tickets', 'rate_tickets', 'eliminar plan_sla',
            'ver dashboard',
            'gestionar usuarios',
            'ver prioridades',
            'ver sla plans',
            'ver usuarios', 'crear prioridad',
            'editar prioridad',
            'eliminar prioridad',
            'crear plan_sla',
            'editar plan_sla',
            'eliminar plan_sla',
            'ver dashboard',
            'ver tickets',
            'view_own_tickets',
            'create_tickets',
            'view_all_tickets'
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        $superAdminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $adminRole      = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $agentRole      = Role::firstOrCreate(['name' => 'agent', 'guard_name' => 'web']);
        $userRole       = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);


        $superAdminRole->syncPermissions(Permission::all());

        $adminRole->syncPermissions([
            'manage_area_tickets', 'assign_tickets', 'view_area_dashboard',
            'create_tickets', 'view_own_tickets'
        ]);

        $agentRole->syncPermissions([
            'view_assigned_tickets', 'solve_tickets', 'return_tickets'
        ]);

        $userRole->syncPermissions([
            'create_tickets', 'view_own_tickets', 'rate_tickets',
        ]);

    }
}
