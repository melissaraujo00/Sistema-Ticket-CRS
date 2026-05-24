<?php

namespace App\Http\Controllers;

use App\Models\TicketHistory;
use App\Models\Ticket;
use App\Enums\ActionTypeEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class TicketHistoryController extends Controller
{
    /*
     * Display a listing of the resource.

     */
    public function index(Ticket $ticket)
    {
        // Aplicamos Policy para asegurar que solo usuarios autorizados vean el historial.
        $this->authorize('viewAny', [TicketHistory::class, $ticket]);

        $user = auth()->user();
        $isStaff = $user->hasRole(['superadmin', 'admin', 'agent']);

        // Auto-detección de expiración de SLA al consultar el historial
        if ($ticket->expiration_date && Carbon::now()->gt(Carbon::parse($ticket->expiration_date))) {
            $alreadyLogged = $ticket->histories()->where('action_type', ActionTypeEnum::SLA_EXPIRED)->exists();
            
            if (!$alreadyLogged && !in_array($ticket->status->name, ['Resuelto', 'Cerrado'])) {
                $diff = Carbon::now()->locale('es')->diffForHumans(Carbon::parse($ticket->expiration_date), ['parts' => 2, 'join' => true]);
                $technicianName = $ticket->assignedUser ? $ticket->assignedUser->name : 'No asignado';

                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $user->id,
                    'action_type' => ActionTypeEnum::SLA_EXPIRED,
                    'internal_note' => "El tiempo límite del Plan SLA venció hace {$diff}.",
                    'assigned_user' => $ticket->assigned_user
                ]);
            }
        }

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

        // Restringir eventos de SLA solo a SuperAdmin, Admin y Técnico
        if (!$isStaff) {
            $slaActions = [
                ActionTypeEnum::SLA_PAUSED,
                ActionTypeEnum::SLA_RESUMED,
                ActionTypeEnum::SLA_EXPIRED,
                ActionTypeEnum::SLA_MET,
                ActionTypeEnum::SLA_PLAN_CHANGED,
            ];

            $histories = $histories->whereNotIn('action_type', $slaActions)->values();
        }

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
