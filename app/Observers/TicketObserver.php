<?php

namespace App\Observers;

use App\Enums\ActionTypeEnum;
use App\Models\Ticket;
use App\Models\TicketHistory;
use Illuminate\Support\Facades\Auth;

class TicketObserver
{
    /**
     * Se ejecuta cuando un ticket es creado por primera vez.
     */
    public function created(Ticket $ticket): void
    {
        $this->createHistory($ticket, ActionTypeEnum::CREATED);
    }

    /**
     * Se ejecuta antes de que los cambios se guarden en la base de datos.
     * Utilizamos isDirty() para detectar qué campos están cambiando en esta petición
     * y getOriginal() para capturar los valores previos antes de que se sobrescriban.
     */
    public function updating(Ticket $ticket): void
    {
        // DETECTAR CAMBIO DE ESTADO
        if ($ticket->isDirty('status_id')) {
            $oldStatusId = $ticket->getOriginal('status_id');
            $newStatusId = $ticket->status_id;
            
            // Buscamos los nombres de los estados para que el historial sea legible
            $oldStatus = \App\Models\Status::find($oldStatusId);
            $newStatus = \App\Models\Status::find($newStatusId);

            $this->createHistory($ticket, ActionTypeEnum::STATUS_CHANGED, [
                'internal_note' => "Estado actualizado: de '" . ($oldStatus->name ?? 'N/A') . "' a '{$newStatus->name}'"
            ]);
        }

        // DETECTAR REASIGNACIÓN DE TÉCNICO
        if ($ticket->isDirty('assigned_user')) {
            $oldAssignedId = $ticket->getOriginal('assigned_user');
            $newAssignedId = $ticket->assigned_user;
            
            // Si el nuevo ID existe, es una asignación; si es null, es una desasignación.
            $action = $newAssignedId ? ActionTypeEnum::ASSIGNED : ActionTypeEnum::UNASSIGNED;
            
            $this->createHistory($ticket, $action, [
                'assigned_user' => $newAssignedId,
                'internal_note' => $newAssignedId 
                    ? "Ticket reasignado al técnico. (Anterior ID: " . ($oldAssignedId ?? 'Sin asignar') . ")"
                    : "El ticket ha sido desasignado del técnico ID: {$oldAssignedId}"
            ]);
        }

        // DETECTAR TRANSFERENCIA DE DEPARTAMENTO
        if ($ticket->isDirty('department_id')) {
            $this->createHistory($ticket, ActionTypeEnum::DEPARTMENT_TRANSFERRED, [
                'previous_department' => $ticket->getOriginal('department_id'),
                'new_department'      => $ticket->department_id,
                'internal_note'       => "El ticket fue transferido entre departamentos por necesidades de servicio."
            ]);
        }

        // DETECTAR CAMBIO DE PRIORIDAD
        if ($ticket->isDirty('priority_id')) {
            $oldPriority = \App\Models\Priority::find($ticket->getOriginal('priority_id'));
            $newPriority = \App\Models\Priority::find($ticket->priority_id);

            $this->createHistory($ticket, ActionTypeEnum::PRIORITY_CHANGED, [
                'internal_note' => "Prioridad modificada: de '" . ($oldPriority->name ?? 'N/A') . "' a '" . ($newPriority->name ?? 'N/A') . "'"
            ]);
        }
    }

    /**
     * Método privado para centralizar la creación del historial.
     */
    private function createHistory(Ticket $ticket, ActionTypeEnum $action, array $data = []): void
    {
        TicketHistory::create(array_merge([
            'ticket_id'   => $ticket->id,
            'user_id'     => Auth::id() ?? $ticket->requesting_user ?? 1,
            'action_type' => $action,
        ], $data));
    }
}