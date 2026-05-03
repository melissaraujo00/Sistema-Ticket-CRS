<?php

namespace App\Services;

use App\Models\Area;
use Exception;

class AreaService
{
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

    /**
     * Actualiza un área existente.
     */
    public function updateArea(Area $area, array $data): bool
    {
        return $area->update($data);
    }

    /**
     * Elimina un área aplicando reglas de integridad referencial.
     * * @throws Exception Si el área tiene departamentos asociados.
     */
    public function deleteArea(Area $area): void
    {
        // Validación de Integridad Referencial
        if ($area->departments()->count() > 0) {
            throw new Exception('No se puede eliminar esta área porque tiene departamentos asociados.');
        }

        $area->delete(); // Ejecuta el Soft Delete
    }
}
