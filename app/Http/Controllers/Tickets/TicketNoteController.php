<?php

namespace App\Http\Controllers\Tickets;

use App\Actions\AddInternalNoteAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternalNoteRequest;
use App\Models\Ticket;

class TicketNoteController extends Controller
{
    public function store(StoreInternalNoteRequest $request, Ticket $ticket, AddInternalNoteAction $action)
    {
        $action->execute(
            $ticket,
            auth()->id(),
            $request->validated('internal_note')
        );

        return redirect()->back()->with('success', 'Nota interna agregada exitosamente a la bitácora.');
    }
}
