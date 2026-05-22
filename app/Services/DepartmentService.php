<?php

namespace App\Services;

use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class DepartmentService
{
    /**
     * Obtiene los departamentos paginados y filtrados para el datatable principal.
     */
    public function getPaginatedDepartments(array $filters): LengthAwarePaginator
    {
        return Department::with(['area:id,name', 'heads:id,name'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email_department', 'like', "%{$search}%");
                });
            })
            ->when($filters['area_id'] ?? null, function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }



    public function getAllDepartments()
    {
        return Department::with(['area:id,name', 'heads:id,name'])->latest()->get();
    }

    public function createDepartment(array $data): Department
    {
        return DB::transaction(function () use ($data) {
            $department = Department::create($data);

            if (!empty($data['head_ids'])) {
                $department->heads()->syncWithPivotValues($data['head_ids'], ['role' => 'head']);
            }

            return $department;
        });
    }

    public function updateDepartment(Department $department, array $data): bool
    {
        return DB::transaction(function () use ($department, $data) {
            $updated = $department->update($data);
            if (array_key_exists('head_ids', $data)) {
                $department->heads()->syncWithPivotValues($data['head_ids'], ['role' => 'head']);
            }

            return $updated;
        });
    }

    public function deleteDepartment(Department $department): bool
    {
        if ($department->divisions()->exists() ||
            $department->tickets()->exists() ||
            $department->heads()->exists()) {
            throw new Exception('No se puede eliminar este departamento porque tiene divisiones, tickets o jefes asignados.');
        }

        return $department->delete();
    }

    public function getTrashedDepartments(): LengthAwarePaginator
    {
        return Department::onlyTrashed()
            ->with('area:id,name')
            ->latest()
            ->paginate(10);
    }

    public function restoreDepartment($id): bool
    {
        return Department::onlyTrashed()->findOrFail($id)->restore();
    }
}
