<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Department;
use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\Priority;
use App\Models\SlaPlan;
use App\Models\Status;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
     * Store a newly created ticket (requires create_tickets permission).
     */
    public function store(StoreTicketRequest $request)
    {
        if (!auth()->user()->can('create_tickets')) {
            abort(403, 'No tienes permiso para crear tickets.');
        }

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $helpTopic = HelpTopic::with(['priority', 'slaPlan'])->findOrFail($validated['help_topic_id']);
            $priority  = $helpTopic->priority;
            $statusOpen = Status::where('name', 'Abierto')->firstOrFail();

            $code = $this->generateTicketCode();
            $creationDate = Carbon::now();

            // Crear el ticket
            $ticket = Ticket::create([
                'code'            => $code,
                'creation_date'   => $creationDate,
                'email'           => Auth::user()->email,
                'subject'         => $validated['subject'],
                'message'         => $validated['message'],
                'expiration_date' => null,
                'closing_date'    => null,
                'requesting_user' => Auth::id(),
                'assigned_user'   => null,
                'help_topic_id'   => $helpTopic->id,
                'priority_id'     => $priority->id,
                'sla_plan_id'     => null,
                'department_id'   => $validated['department_id'],
                'status_id'       => $statusOpen->id,
            ]);

            // Procesar múltiples archivos
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $extension    = $file->getClientOriginalExtension();
                    $newFileName  = Str::random(40) . '.' . $extension;

                    $path = $file->storeAs(
                        "tickets/{$ticket->id}",
                        $newFileName,
                        'public'
                    );

                    $ticket->attachments()->create([
                        'file_name' => $originalName,
                        'file_path' => $path,
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            // Disparar evento
            event(new \App\Events\TicketCreated($ticket));

            DB::commit();

            return redirect()->route('tickets.index')->with('success', 'Ticket creado correctamente');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear ticket: ' . $e->getMessage());

            return redirect()->back()->withInput()->with('error', 'Ocurrió un error al crear el ticket. Por favor, inténtelo de nuevo.');
        }
    }

    /**
     * Generate a unique ticket code.
     */
    private function generateTicketCode()
    {
        $prefix = 'TKT';
        $date = Carbon::now()->format('Ymd');
        $lastTicket = Ticket::whereDate('creation_date', Carbon::today())->orderBy('id', 'desc')->first();
        $sequence = $lastTicket ? intval(substr($lastTicket->code, -4)) + 1 : 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }

    /**
     * Display the specified ticket (requires view_all_tickets permission).
     */
    public function show(Ticket $ticket)
    {
        if (!auth()->user()->can('view_all_tickets')) {
            abort(403, 'No tienes permiso para ver este ticket.');
        }

        $ticket->load(['department', 'division', 'helpTopic', 'status', 'priority']);

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
    public function unassigned()
    {
        if (!auth()->user()->can('assign_tickets')) {
            abort(403, 'No tienes permiso para ver tickets pendientes de asignación.');
        }

        $tickets = Ticket::with(['department', 'priority', 'requestingUser', 'status'])
            ->whereNull('assigned_user')
            ->orderBy('creation_date', 'asc')
            ->get();

        $tecnicos = User::role('agent')->get(['id', 'name']);

        return Inertia::render('tickets/unassigned', [
            'tickets' => $tickets,
            'tecnicos' => $tecnicos
        ]);
    }

    /**
     * Assign a technician to a ticket (requires assign_tickets permission).
     */
    public function assign(Request $request, Ticket $ticket)
    {
        if (!auth()->user()->can('assign_tickets')) {
            abort(403, 'No tienes permiso para asignar tickets.');
        }

        $request->validate([
            'tecnico_id' => 'required|exists:users,id'
        ]);

        $ticket->assigned_user = $request->tecnico_id;

        $statusInProgress = Status::where('name', 'En Proceso')->first();
        if ($statusInProgress) {
            $ticket->status_id = $statusInProgress->id;
        }

        $ticket->save();

        return back()->with('success', 'Técnico asignado y ticket marcado "En Proceso" exitosamente.');
    }

}
