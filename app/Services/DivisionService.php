<?php

namespace App\Services;

use App\Models\Division;
use App\Models\Department;
use Illuminate\Pagination\LengthAwarePaginator;

class DivisionService
{
    /**
     * Obtiene las divisiones paginadas y filtradas para el datatable.
     */
    public function getPaginatedDivisions(array $filters): LengthAwarePaginator
    {
        return Division::with('department.area')
            // 1. Agrupamos la búsqueda con un sub-where usando una función anónima
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('department', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        });
                });
            })
            // 2. El filtro por departamento ahora se aplicará estrictamente al resultado de arriba
            ->when($filters['department_id'] ?? null, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Obtiene la lista de departamentos para los selectores del formulario.
     */
    public function getDepartmentsList()
    {
        return Department::with('area')->orderBy('name')->get(['id', 'name', 'area_id']);
    }

    public function createDivision(array $data): Division
    {
        return Division::create($data);
    }

    public function updateDivision(Division $division, array $data): bool
    {
        return $division->update($data);
    }

    /**
     * Elimina (SoftDelete) la división validando que no tenga dependencias críticas.
     */
    public function deleteDivision(Division $division): void
    {
        if ($division->helpTopics()->exists()) {
            throw new \Exception('No se puede eliminar la división porque tiene Temas de Ayuda asociados.');
        }

        $division->delete();
    }

    public function getTrashedDivisions(array $filters = [])
    {
        return Division::onlyTrashed()
            ->with('department.area')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('department', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();
    }

    public function restoreDivision(int $id): void
    {
        $division = Division::onlyTrashed()->findOrFail($id);
        $division->restore();
    }
}
