<?php

namespace App\Services;

use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserService
{
    /**
     * Obtener todos los usuarios con sus relaciones y filtrados por nivel de acceso.
     */
    public function getAllUsers()
    {
        $authUser = auth()->user();

        // 1. El SuperAdmin ve absolutamente todo
        if ($authUser->hasRole('superadmin')) {
            return User::with('department', 'roles')->latest()->get();
        }

        // 2. El Admin de área solo ve a los Agentes de su departamento
        if ($authUser->hasRole('admin')) {
            return User::role('agent') // Filtramos por rol técnico
            ->where('department_id', $authUser->department_id) // Solo de su departamento
            ->with('department', 'roles')
                ->latest()
                ->get();
        }

        return collect();
    }

    /**
     * Obtener lista de departamentos (id, name).
     */
    public function getDepartmentsList()
    {
        return Department::all(['id', 'name']);
    }

    /**
     * Obtener lista de nombres de roles.
     */
    public function getRolesList()
    {
        return Role::pluck('name');
    }

    /**
     * Crear un nuevo usuario y asignarle rol.
     */
    public function createUser(array $data): User
    {
        $data['is_active'] = true;
        $user = User::create($data);
        $user->assignRole($data['role']);

        return $user;
    }

    /**
     * Actualizar un usuario existente y sincronizar su rol.
     */
    public function updateUser(User $user, array $data): User
    {
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        if (isset($data['role'])) {
            $user->syncRoles($data['role']);
        }
        return $user->fresh();
    }

    /**
     * Eliminar un usuario con protecciones de seguridad.
     */
    public function deleteUser(User $user): void
    {
        if ($user->id === 1 || $user->id === auth()->id()) {
            throw new \Exception("No se puede eliminar este usuario por razones de seguridad.");
        }

        $user->delete();
    }

    /**
     * Obtener un usuario con sus relaciones para editar/mostrar.
     */
    public function getUserWithRelations(User $user): User
    {
        return $user->load('department', 'roles');
    }
}
