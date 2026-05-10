<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Area;
use App\Http\Requests\SaveDepartmentRequest;
use App\Services\DepartmentService;
use Inertia\Inertia;
use Exception;
use Illuminate\Http\RedirectResponse; // ¡Importación correcta de Laravel!

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    public function index()
    {
        return Inertia::render('departments/index', [
            'departments' => $this->departmentService->getAllDepartments()
        ]);
    }

    public function create()
    {
        return Inertia::render('departments/create', [
            'areas' => Area::all(['id', 'name'])
        ]);
    }

    public function store(SaveDepartmentRequest $request): RedirectResponse
    {
        try {
            $this->departmentService->createDepartment($request->validated());

            return redirect()->route('departments.index')
                ->with('success', 'Departamento creado correctamente.');
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear el departamento: ' . $e->getMessage());
        }
    }

    public function edit(Department $department)
    {
        return Inertia::render('departments/edit', [
            'department' => $department,
            'areas'      => Area::all(['id', 'name'])
        ]);
    }

    public function update(SaveDepartmentRequest $request, Department $department): RedirectResponse
    {
        try {
            $this->departmentService->updateDepartment($department, $request->validated());

            return redirect()->route('departments.index')
                ->with('success', 'Departamento actualizado correctamente.');
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el departamento: ' . $e->getMessage());
        }
    }

    public function destroy(Department $department): RedirectResponse
    {
        try {
            $this->departmentService->deleteDepartment($department);

            return redirect()->route('departments.index')
                ->with('success', 'Departamento eliminado correctamente.');

        } catch (Exception $e) {
            return redirect()->route('departments.index')
                ->with('error', $e->getMessage());
        }
    }

    public function trashed()
    {
        return Inertia::render('departments/trashed', [
            'departments' => $this->departmentService->getTrashedDepartments(),
        ]);
    }

    public function restore($id): RedirectResponse
    {
        try {
            $this->departmentService->restoreDepartment($id);

            return redirect()->route('departments.trashed')
                ->with('success', 'Departamento restaurado exitosamente.');
        } catch (Exception $e) {
            return redirect()->route('departments.trashed')
                ->with('error', 'Error al restaurar el departamento: ' . $e->getMessage());
        }
    }
}
