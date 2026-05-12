<?php

namespace App\Policies;

use App\Models\TicketHistory;
use App\Models\User;
use App\Models\Ticket;
use Illuminate\Auth\Access\Response;

class TicketHistoryPolicy
{
    /**
     * Determina si el usuario puede ver la lista de historiales del ticket.
     * 
     * Implementa la lógica de permisos granulares para la auditoría.
     */
    public function viewAny(User $user, Ticket $ticket): bool
    {
        // 1. Administradores o personal con permiso global pueden ver todo historial.
        if ($user->can('view_all_tickets') || $user->hasRole('admin')) {
            return true;
        }

        // 2. El técnico que tiene asignado el ticket necesita ver el historial para trabajar.
        if ($ticket->assigned_user === $user->id) {
            return true;
        }

        // 3. El usuario solicitante tiene derecho a ver el ciclo de vida de su propia petición.
        if ($ticket->requesting_user === $user->id) {
            return true;
        }

        // Por defecto, se deniega el acceso (403 Prohibido).
        return false;
    }

    /**
     * Ninguna petición HTTP POST puede crear registros manualmente.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * No se permite la edición de registros históricos bajo ninguna circunstancia.
     */
    public function update(User $user, TicketHistory $ticketHistory): bool
    {
        return false;
    }

    /**
     * No se permite borrar eventos del historial, garantizando la integridad de la auditoría.
     */
    public function delete(User $user, TicketHistory $ticketHistory): bool
    {
        return false;
    }
}
