<?php

namespace App\Actions;

use App\Enums\ActionTypeEnum;
use App\Models\Ticket;
use App\Models\TicketHistory;

class AddInternalNoteAction
{
    /**
     * Ejecuta la acción de guardar una nota interna.
     */
    public function execute(Ticket $ticket, int $userId, string $note): TicketHistory
    {
        return TicketHistory::create([
            'ticket_id'           => $ticket->id,
            'user_id'             => $userId,
            'action_type'         => ActionTypeEnum::NOTE_ADDED,
            'internal_note'       => $note,
            'previous_department' => $ticket->department_id,
            'assigned_user'       => $ticket->assigned_user,
        ]);
    }
}
