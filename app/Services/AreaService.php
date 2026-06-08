<?php

namespace App\Services;

use App\Models\Area;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class AreaService
{
    /**
     * Obtiene las áreas paginadas y filtradas para el datatable principal.
     */
    public function getPaginatedAreas(array $filters): LengthAwarePaginator
    {
        return Area::when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }


    /**
     * Obtiene todas las áreas ordenadas por las más recientes.
     */
    public function getAllAreas()
    {
        return Area::latest()->get();
    }

    /**
     * Crea una nueva área en la base de datos.
     */
    public function createArea(array $data): Area
    {
        return Area::create($data);
    }

    public function getTrashedAreas(array $filters = []): LengthAwarePaginator
    {
        return Area::onlyTrashed()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Actualiza un área existente.
     */
    public function updateArea(Area $area, array $data): bool
    {
        return $area->update($data);
    }

    /**
     * Restaura un área específica.
     */
    public function restoreArea($id): bool
    {
        $area = Area::onlyTrashed()->findOrFail($id);
        return $area->restore();
    }

    /**
     * Elimina un área aplicando reglas de integridad referencial.
     * * @throws Exception Si el área tiene departamentos asociados.
     */
    public function deleteArea(Area $area): void
    {
        if ($area->tickets()->count() > 0) {
            throw new Exception('No se puede eliminar esta área porque existen tickets registrados en sus departamentos.');
        }

        if ($area->departments()->count() > 0) {
            throw new Exception('No se puede eliminar esta área porque tiene departamentos asociados.');
        }

        $area->delete(); // Ejecuta el Soft Delete
    }
}
