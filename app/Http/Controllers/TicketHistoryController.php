<?php

namespace App\Http\Controllers;

use App\Models\TicketHistory;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketHistoryController extends Controller
{
    /*
     * Display a listing of the resource.

     */
    public function index(Ticket $ticket)
    {
        // Aplicamos Policy para asegurar que solo usuarios autorizados vean el historial.
        // Retornará 403 automáticamente si falla.
        $this->authorize('viewAny', [TicketHistory::class, $ticket]);

        $ticket->load(['status', 'department', 'assignedUser']);

        $histories = $ticket->histories()
            ->with([
                'user',
                'previousDepartment',
                'newDepartment',
                'assignedTo'
            ])
            ->latest()
            ->get();

        return Inertia::render('ticketHistory/index', [
            'ticket' => $ticket,
            'histories' => $histories
        ]);
    }

    public function store(Request $request)
    {
        // No implementado
    }

    public function update(Request $request, TicketHistory $ticketHistory)
    {
        // No implementado
    }

    public function destroy(TicketHistory $ticketHistory)
    {
        // No implementado
    }

    public function create() 
    {
        // No implementado
    }

    public function show(TicketHistory $ticketHistory) 
    {
        // No implementado
    }

    public function edit(TicketHistory $ticketHistory) 
    {
        // No implementado
    }
}
