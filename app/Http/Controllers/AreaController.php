<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Http\Requests\SaveAreaRequest;
use Illuminate\Http\Request;
use App\Services\AreaService;
use Inertia\Inertia;
use Exception;
use Symfony\Component\HttpFoundation\RedirectResponse;

class AreaController extends Controller
{
    protected $areaService;

    public function __construct(AreaService $areaService)
    {
        $this->areaService = $areaService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        return Inertia::render('areas/index', [
            'areas'   => $this->areaService->getPaginatedAreas($filters),
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('areas/create');
    }

    public function store(SaveAreaRequest $request)
    {
        try {
            $this->areaService->createArea($request->validated());

            return redirect()->route('areas.index')
                ->with('success', 'Área creada correctamente.');
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear el área: ' . $e->getMessage());
        }
    }

    public function show(Area $area)
    {
        return Inertia::render('areas/show', [
            'area' => $area
        ]);
    }

    public function edit(Area $area)
    {
        return Inertia::render('areas/edit', [
            'area' => $area
        ]);
    }

    public function update(SaveAreaRequest $request, Area $area)
    {
        try {
            $this->areaService->updateArea($area, $request->validated());

            return redirect()->route('areas.index')
                ->with('success', 'Área actualizada correctamente.');
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el área: ' . $e->getMessage());
        }
    }

    public function destroy(Area $area): RedirectResponse
    {
        try {
            $this->areaService->deleteArea($area);

            return redirect()->route('areas.index')
                ->with('success', 'Área eliminada correctamente.');

        } catch (Exception $e) {
            return redirect()->route('areas.index')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Muestra la lista de áreas en la papelera (Soft Deleted).
     */
    public function trashed(Request $request)
    {
        $filters = $request->only(['search']);

        return Inertia::render('areas/trashed', [
            'areas' => $this->areaService->getTrashedAreas($filters),
            'filters' => $filters,
        ]);
    }

    /**
     * Restaura un área eliminada.
     */
    public function restore($id): RedirectResponse
    {
        try {
            $this->areaService->restoreArea($id);

            return redirect()->route('areas.trashed')
                ->with('success', 'Área restaurada exitosamente.');
        } catch (Exception $e) {
            return redirect()->route('areas.trashed')
                ->with('error', 'Error al restaurar el área: ' . $e->getMessage());
        }
    }
}
