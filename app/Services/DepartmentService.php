<?php

namespace App\Services;

use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Exception;

class DepartmentService
{
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

    public function getTrashedDepartments()
    {
        return Department::with('area:id,name')->onlyTrashed()->latest()->get();
    }

    public function restoreDepartment($id): bool
    {
        return Department::onlyTrashed()->findOrFail($id)->restore();
    }
}
