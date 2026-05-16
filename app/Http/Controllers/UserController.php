<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Services\UserService;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;

        $this->middleware('permission:manage_users')->only([
            'create', 'store', 'edit', 'update', 'destroy', 'trashed', 'restore'
        ]);
    }

    public function index(\Illuminate\Http\Request $request)
    {
        $filters = $request->only(['search', 'area_id', 'department_id']);

        return Inertia::render('users/index', [
            'users'       => $this->userService->getPaginatedUsersForIndex($filters),
            'filters'     => $filters,
            'areas'       => $this->userService->getAreasList(),
            'departments' => $this->userService->getDepartmentsList(),
            'roles'       => $this->userService->getRolesList(),
        ]);
    }

    public function create()
    {
        return Inertia::render('users/create', [
            'areas'       => $this->userService->getAreasList(),
            'departments' => $this->userService->getDepartmentsList(),
            'roles'       => $this->userService->getRolesList(),
        ]);
    }

    public function store(UserStoreRequest $request)
    {
        $this->userService->createUser($request->validated());

        return redirect()->route('users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function show(User $user)
    {
        return Inertia::render('users/show', [
            'user' => $this->userService->getUserWithRelations($user),
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user'        => $this->userService->getUserWithRelations($user),
            'areas'       => $this->userService->getAreasList(),
            'departments' => $this->userService->getDepartmentsList(),
            'roles'       => $this->userService->getRolesList(),
        ]);
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $this->userService->updateUser($user, $request->validated());

        return redirect()->route('users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->deleteUser($user);
            return redirect()->route('users.index')
                ->with('success', 'Usuario enviado a la papelera.');
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', $e->getMessage());
        }
    }

    public function trashed()
    {
        return Inertia::render('users/trashed', [
            'users' => $this->userService->getTrashedUsers(),
        ]);
    }

    public function restore($id)
    {
        try {
            $this->userService->restoreUser($id);
            return redirect()->route('users.trashed')
                ->with('success', 'Usuario restaurado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('users.trashed')
                ->with('error', 'Error al restaurar: ' . $e->getMessage());
        }
    }
}
