<?php

namespace App\Observers;

use App\Enums\ActionTypeEnum;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\Status;
use App\Models\Priority;
use App\Models\SlaPlan;
use Illuminate\Support\Carbon;
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
            $oldStatus = Status::find($oldStatusId);
            $newStatus = Status::find($newStatusId);

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
                    ? "Ticket reasignado al técnico."
                    : "El ticket ha sido desasignado del técnico."
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
            $oldPriority = Priority::find($ticket->getOriginal('priority_id'));
            $newPriority = Priority::find($ticket->priority_id);

            $this->createHistory($ticket, ActionTypeEnum::PRIORITY_CHANGED, [
                'internal_note' => "Prioridad modificada de: '" . ($oldPriority->name ?? 'Sin Prioridad') . "' a '" .  ($newPriority->name ?? 'N/A') . "'"
            ]);
        }

        // DETECTAR CAMBIO DE PLAN SLA
        if ($ticket->isDirty('sla_plan_id')) {
            $oldPlan = SlaPlan::find($ticket->getOriginal('sla_plan_id'));
            $newPlan = SlaPlan::find($ticket->sla_plan_id);

            $this->createHistory($ticket, ActionTypeEnum::SLA_PLAN_CHANGED, [
                'internal_note' => "Plan SLA actualizado: de '" . ($oldPlan->name ?? 'Sin Plan') . "' a '" . ($newPlan->name ?? 'N/A') . "'"
            ]);
        }

        // DETECTAR CUMPLIMIENTO DE SLA AL RESOLVER/CERRAR
        if ($ticket->isDirty('status_id')) {
            $newStatus = Status::find($ticket->status_id);
            if ($newStatus && in_array($newStatus->name, ['Resuelto', 'Cerrado'])) {
                $this->checkAndLogSlaCompliance($ticket);
            }

            // Registro de pausa
            if ($newStatus && $newStatus->name === 'No Resuelto') {
                $this->createHistory($ticket, ActionTypeEnum::SLA_PAUSED, [
                    'internal_note' => 'El conteo del SLA ha sido pausado debido al estado del ticket.'
                ]);
            }
        }
    }

    /**
     * Verifica el cumplimiento del SLA y registra el evento correspondiente.
     */
    private function checkAndLogSlaCompliance(Ticket $ticket): void
    {
        if (!$ticket->expiration_date) {
            return;
        }

        $now = now();
        $expiration = Carbon::parse($ticket->expiration_date);
        $isCompliant = $now->lte($expiration);

        // Calcular tiempo restante o de retraso
        $diff = $now->locale('es')->diffForHumans($expiration, [
            'parts' => 2,
            'join' => true,
            'short' => false,
        ]);

        $technicianName = $ticket->assignedUser ? $ticket->assignedUser->name : 'No asignado';

        if ($isCompliant) {
            $note = "SLA Cumplido. El ticket fue resuelto a tiempo. Tiempo restante: {$diff}.";
            $action = ActionTypeEnum::SLA_MET;
        } else {
            $note = "SLA Incumplido. El ticket excedió el tiempo límite por {$diff}.";
            $action = ActionTypeEnum::SLA_EXPIRED;
        }

        $this->createHistory($ticket, $action, [
            'internal_note' => $note,
            'assigned_user' => $ticket->assigned_user
        ]);
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