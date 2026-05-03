<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Http\Requests\SaveAreaRequest;
use App\Services\AreaService;
use Inertia\Inertia;
use Exception;

class AreaController extends Controller
{
    protected $areaService;

    public function __construct(AreaService $areaService)
    {
        $this->areaService = $areaService;
    }

    public function index()
    {
        return Inertia::render('areas/index', [
            'areas' => $this->areaService->getAllAreas()
        ]);
    }

    public function store(SaveAreaRequest $request)
    {
        $this->areaService->createArea($request->validated());

        return redirect()->back()->with('success', 'Área creada correctamente.');
    }

    public function update(SaveAreaRequest $request, Area $area)
    {
        $this->areaService->updateArea($area, $request->validated());

        return redirect()->back()->with('success', 'Área actualizada correctamente.');
    }

    public function destroy(Area $area)
    {
        try {
            $this->areaService->deleteArea($area);

            return redirect()->back()->with('success', 'Área eliminada correctamente.');

        } catch (Exception $e) {
            // Intercepta la excepción del servicio y retorna el mensaje de error al frontend
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
