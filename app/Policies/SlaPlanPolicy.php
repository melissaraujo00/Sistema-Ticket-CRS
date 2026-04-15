<?php

namespace App\Policies;

use App\Models\SlaPlan;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SlaPlanPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('ver sla plans');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SlaPlan $slaPlan): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear prioridad');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SlaPlan $slaPlan): bool
    {
        return $user->can('editar plan_sla');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SlaPlan $slaPlan): bool
    {
        return $user->can('eliminar plan_sla');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SlaPlan $slaPlan): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SlaPlan $slaPlan): bool
    {
        return false;
    }
}
