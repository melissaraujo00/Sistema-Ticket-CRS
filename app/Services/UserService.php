<?php

namespace App\Services;

use App\Models\User;
use App\Models\Area;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserService
{
    public function getAllUsers()
    {
        $authUser = auth()->user();

        if ($authUser->hasRole('superadmin')) {
            return User::with(['department.area', 'roles'])->latest()->get();
        }

        if ($authUser->hasRole('admin')) {
            return User::role('agent')
                ->where('department_id', $authUser->department_id)
                ->with(['department.area', 'roles'])
                ->latest()
                ->get();
        }

        return collect();
    }

    /**
     * Obtiene usuarios paginados y filtrados exclusivamente para la tabla principal.
     */
    public function getPaginatedUsersForIndex(array $filters)
    {
        $authUser = auth()->user();

        $query = User::with(['department.area', 'roles']);

        // políticas de acceso
        if ($authUser->hasRole('admin')) {
            $query->role('agent')->where('department_id', $authUser->department_id);
        } elseif (!$authUser->hasRole('superadmin')) {
            return collect();
        }

        return $query
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('institution_code', 'like', "%{$search}%");
                });
            })
            ->when($filters['area_id'] ?? null, function ($q, $areaId) {
                // usuarios cuyo departamento pertenezca al área seleccionada
                $q->whereHas('department', function ($deptQuery) use ($areaId) {
                    $deptQuery->where('area_id', $areaId);
                });
            })
            ->when($filters['department_id'] ?? null, function ($q, $deptId) {
                $q->where('department_id', $deptId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }


    public function getDepartmentsList()
    {
        return Department::all(['id', 'name', 'area_id']);
    }

    public function getRolesList()
    {
        return Role::pluck('name');
    }

    public function getAreasList()
    {
        return Area::all(['id', 'name']);
    }

    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $data['is_active'] = true;
            $user = User::create($data);
            $user->assignRole($data['role']);

            if (isset($data['is_head']) && $data['is_head'] == true && $data['role'] === 'admin') {
                $user->headedDepartments()->attach($data['department_id'], ['role' => 'head']);
            }

            return $user;
        });
    }

    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            if (empty($data['password'])) {
                unset($data['password']);
            }

            $user->update($data);

            if (isset($data['role'])) {
                $user->syncRoles($data['role']);

                if ($data['role'] === 'admin') {
                    if (isset($data['is_head']) && $data['is_head'] == true) {
                        $user->headedDepartments()->syncWithoutDetaching([
                            $data['department_id'] => ['role' => 'head']
                        ]);
                    } else {
                        $user->headedDepartments()->detach($data['department_id']);
                    }
                } else {
                    $user->headedDepartments()->detach();
                }
            }

            return $user->fresh();
        });
    }

    public function deleteUser(User $user): void
    {
        if ($user->id === 1 || $user->id === auth()->id()) {
            throw new \Exception("No se puede eliminar este usuario por razones de seguridad.");
        }

        $user->delete();
    }

    public function getUserWithRelations(User $user): User
    {
        return $user->load(['department.area', 'roles', 'headedDepartments']);
    }

    public function getTrashedUsers(array $filters = [])
    {
        return User::onlyTrashed()
            ->with(['department', 'roles'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('institution_code', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function restoreUser($id): bool
    {
        return User::onlyTrashed()->findOrFail($id)->restore();
    }
}
