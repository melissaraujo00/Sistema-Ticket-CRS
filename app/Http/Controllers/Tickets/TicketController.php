<?php

namespace App\Http\Controllers\Tickets;

use App\Http\Requests\CloseTicketRequest;
use App\Http\Requests\StoreInternalNoteRequest;
use App\Models\Department;
use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\Ticket;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use App\Notifications\NewTicketNotification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Actions\AddInternalNoteAction;
use App\Actions\GenerateTicketCodeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Status;

class TicketController extends Controller
{
    /**
     * Display a listing of all tickets (requires view_all_tickets permission).
     */
    public function index()
    {
        if (!auth()->user()->can('view_all_tickets')) {
            abort(403, 'No tienes permiso para ver todos los tickets.');
        }

        $tickets = Ticket::with(['department', 'assignedUser', 'status'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Show the form for creating a new ticket (requires create_tickets permission).
     */
    public function create()
    {
        if (!auth()->user()->can('create_tickets')) {
            abort(403, 'No tienes permiso para crear tickets.');
        }

        $departments = Department::all(['id', 'name']);
        $divisions = Division::all(['id', 'name', 'department_id']);
        $helpTopics = HelpTopic::select('id', 'name_topic', 'division_id')->get();

        return Inertia::render('tickets/create', [
            'departments' => $departments,
            'divisions' => $divisions,
            'helpTopics' => $helpTopics,
        ]);
    }

    /**
     * Display the specified ticket (requires view_all_tickets permission).
     */
    public function show(Ticket $ticket)
    {
        $user = auth()->user();

        // 1. ¿Tiene permiso para ver todos los tickets? (Admins)
        $canViewAll = $user->can('view_all_tickets');

        // 2. ¿Es su propio ticket? (Usuarios normales)
        $isOwnTicket = $user->can('view_own_tickets') && $ticket->requesting_user === $user->id;

        // 3. ¿Es el técnico asignado? (Agentes)
        $isAssignedAgent = $ticket->assigned_user === $user->id;

        if (!$canViewAll && !$isOwnTicket && !$isAssignedAgent) {
            abort(403, 'No tienes permiso para ver este ticket.');
        }

        // ==========================================================
        // REDIRECCIÓN INTELIGENTE PARA ASIGNADORES Y SUPERADMINS
        // ==========================================================
        // Si el usuario puede asignar tickets Y (es superadmin o el ticket es de su departamento)
        if ($user->can('assign_tickets') && ($user->hasRole('superadmin') || $user->department_id === $ticket->department_id)) {
            // Lo enviamos automáticamente a la vista de gestión
            return redirect()->route('tickets.showAsignador', $ticket->id);
        }
        // ==========================================================

        $ticket->load([
            'department',
            'helpTopic.division',
            'status',
            'priority',
            'assignedUser',
            'ticketSolutions.solutionType',
            'ticketSolutions.attachments',
            'histories',
            'histories.user'
        ]);

        return Inertia::render('tickets/show', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Display tickets of the authenticated user (requires view_own_tickets permission).
     */
    public function myTickets()
    {
        if (!auth()->user()->can('view_own_tickets')) {
            abort(403, 'No tienes permiso para ver tus tickets.');
        }

        $tickets = Ticket::with(['department', 'assignedUser', 'status'])
            ->where('requesting_user', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Display unassigned tickets (requires assign_tickets permission).
     */


    /**
     * Cancela un ticket si aún está pendiente de asignación.
     */
    public function cancel(Ticket $ticket)
    {
        // 1. Verificar que el ticket pertenezca al usuario autenticado
        if ($ticket->requesting_user !== auth()->id()) {
            abort(403, 'No puedes cancelar un ticket que no te pertenece.');
        }

        // 2. Verificar que el estado actual sea "Pendiente a asignación"
        if ($ticket->status->name !== 'Pendiente a asignación') {
            return redirect()->back()->with('error', 'Solo puedes cancelar tickets que aún no han sido asignados.');
        }

        // 3. Buscar el estado de "Cancelado" o "Cerrado" (Ajusta el nombre según tu BD)
        // Si en tu BD lo llamas "Cerrado" en lugar de "Cancelado", cambia la palabra abajo:
        $statusCancelado = \App\Models\Status::where('name', 'Cancelado')->first();

        if (!$statusCancelado) {
            // Fallback por si no tienes el estado "Cancelado" creado en BD
            $statusCancelado = \App\Models\Status::where('name', 'Cerrado')->firstOrFail();
        }

        // 4. Actualizar el ticket
        $ticket->update([
            'status_id' => $statusCancelado->id,
            'closing_date' => now(), // Registramos cuándo se cerró/canceló
        ]);

        return redirect()->route('tickets.my')->with('success', 'Tu ticket ha sido cancelado exitosamente.');
    }

    /**
     * Cierra el ticket y guarda la calificación del usuario.
     */
    public function close(CloseTicketRequest $request, Ticket $ticket)
    {
        $validated = $request->validated();
        $statusCerrado = \App\Models\Status::where('name', 'Cerrado')->firstOrFail();

        $ticket->update([
            'status_id' => $statusCerrado->id,
            'closing_date' => now(),
            // 'rating' => $validated['rating'],
            // 'user_comment' => $validated['comment'],
        ]);

        return redirect()->back()->with('success', 'Ticket calificado y cerrado exitosamente.');
    }

    public function store(StoreTicketRequest $request, GenerateTicketCodeAction $generateCode)
    {
        $validated = $request->validated();

        $helpTopic = HelpTopic::with(['priority', 'slaPlan'])->findOrFail($validated['help_topic_id']);

        $statusOpen = Status::where('name', 'Pendiente a asignación')->firstOrFail();

        $code = $generateCode->execute();

        $ticket = Ticket::create([
            'code'            => $code,
            'creation_date'   => Carbon::now(),
            'email'           => Auth::user()->email,
            'subject'         => $validated['subject'],
            'message'         => $validated['message'],
            'attach'          => null,
            'expiration_date' => null,
            'closing_date'    => null,
            'requesting_user' => Auth::id(),
            'assigned_user'   => null,
            'help_topic_id'   => $helpTopic->id,
            'priority_id'     => null,
            'sla_plan_id'     => null,
            'department_id'   => $validated['department_id'],
            'status_id'       => $statusOpen->id,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->storeAs(
                    "tickets/{$ticket->id}",
                    Str::random(40) . '.' . $file->getClientOriginalExtension(),
                    'public'
                );
                $ticket->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $department = Department::with('heads')->find($ticket->department_id);
        if ($department && $department->heads->count()) {
            foreach ($department->heads as $head) {
                $head->notify(new NewTicketNotification($ticket));
            }
        }

        return redirect()->route('tickets.my')
            ->with('success', 'Ticket creado correctamente. El jefe del departamento lo asignará.');
    }


    public function agregarNotaInterna(StoreInternalNoteRequest $request, Ticket $ticket, AddInternalNoteAction $action)
    {

        $action->execute(
            $ticket,
            auth()->id(),
            $request->validated('internal_note')
        );

        return redirect()->back()->with('success', 'Nota interna agregada exitosamente a la bitácora.');
    }
}
