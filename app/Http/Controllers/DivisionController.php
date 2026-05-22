<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Department;
use App\Http\Requests\SaveDivisionRequest;
use App\Services\DivisionService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class DivisionController extends Controller
{
    /**
     * Instancia del servicio de negocio de divisiones.
     */
    protected DivisionService $divisionService;

    /**
     * Constructor con inyección de dependencias y políticas de seguridad.
     */
    public function __construct(DivisionService $divisionService)
    {
        $this->divisionService = $divisionService;

        $this->middleware('permission:manage_divisions');
    }

    /**
     * Muestra el listado de divisiones con filtros y paginación.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'department_id']);

        return Inertia::render('divisions/index', [
            'divisions'   => $this->divisionService->getPaginatedDivisions($filters),
            'filters'     => $filters,
            'departments' => $this->divisionService->getDepartmentsList(),
        ]);
    }

    /**
     * Muestra el formulario para registrar una nueva división.
     */
    public function create(): Response
    {
        return Inertia::render('divisions/create', [
            'departments' => $this->divisionService->getDepartmentsList(),
        ]);
    }

    /**
     * Almacena una división recién creada en la base de datos.
     */
    public function store(SaveDivisionRequest $request): RedirectResponse
    {
        $this->divisionService->createDivision($request->validated());

        return redirect()->route('divisions.index')
            ->with('success', 'División creada correctamente.');
    }

    /**
     * Muestra el formulario para editar una división existente.
     */
    public function edit(Division $division): Response
    {
        return Inertia::render('divisions/edit', [
            'division'    => $division,
            'departments' => $this->divisionService->getDepartmentsList(),
        ]);
    }

    /**
     * Actualiza la división especificada en la base de datos.
     */
    public function update(SaveDivisionRequest $request, Division $division): RedirectResponse
    {
        $this->divisionService->updateDivision($division, $request->validated());

        return redirect()->route('divisions.index')
            ->with('success', 'División actualizada correctamente.');
    }

    /**
     * Envía la división seleccionada a la papelera (Soft Delete).
     */
    public function destroy(Division $division): RedirectResponse
    {
        try {
            $this->divisionService->deleteDivision($division);
            return redirect()->route('divisions.index')
                ->with('success', 'División enviada a la papelera.');
        } catch (Exception $e) {
            return redirect()->route('divisions.index')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Muestra el listado de divisiones eliminadas lógicamente.
     */
    public function trashed(Request $request): Response
    {
        $filters = $request->only(['search']);

        return Inertia::render('divisions/trashed', [
            'divisions' => $this->divisionService->getTrashedDivisions($filters),
            'filters' => $filters,
        ]);
    }

    /**
     * Restaura una división desde la papelera de reciclaje.
     */
    public function restore(int $id): RedirectResponse
    {
        try {
            $this->divisionService->restoreDivision($id);
            return redirect()->route('divisions.trashed')
                ->with('success', 'División restaurada exitosamente.');
        } catch (Exception $e) {
            return redirect()->route('divisions.trashed')
                ->with('error', 'Error al restaurar: ' . $e->getMessage());
        }
    }
}
