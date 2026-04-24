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
use App\Notifications\NewTicketNotification;
use App\Notifications\TicketAssignedNotification;
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

    private function generateTicketCode()
    {
        $prefix = 'TKT';
        $date = Carbon::now()->format('Ymd');
        $lastTicket = Ticket::whereDate('creation_date', Carbon::today())->orderBy('id', 'desc')->first();
        $sequence = $lastTicket ? intval(substr($lastTicket->code, -4)) + 1 : 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }


    /**
     * Store a newly created ticket (requires create_tickets permission).
     */


    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();


        $helpTopic = HelpTopic::with(['priority', 'slaPlan'])->findOrFail($validated['help_topic_id']);
        $priority = $helpTopic->priority;
        $slaPlan = $helpTopic->slaPlan;


        $statusOpen = Status::where('name', 'Pendiente a asignación')->firstOrFail();


        $code = $this->generateTicketCode();


        $creationDate = Carbon::now();
        $expirationDate = $slaPlan ? $creationDate->copy()->addHours($slaPlan->grace_time_hours) : null;


        $ticket = Ticket::create([
            'code'            => $code,
            'creation_date'   => $creationDate,
            'email'           => Auth::user()->email,
            'subject'         => $validated['subject'],
            'message'         => $validated['message'],
            'attach'          => null,
            'expiration_date' => $expirationDate,
            'closing_date'    => null,
            'requesting_user' => Auth::id(),
            'assigned_user'   => null,
            'help_topic_id'   => $helpTopic->id,
            'priority_id'     => $priority->id ?? null,
            'sla_plan_id'     => $slaPlan->id ?? null,
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

        $user = auth()->user();
        $departmentId = $user->department_id;

        // If admin has no department, maybe show nothing? Or for superadmin all.
        if ($user->hasRole('superadmin')) {
            $tickets = Ticket::with(['department', 'priority', 'requestingUser', 'status'])
                ->whereNull('assigned_user')
                ->orderBy('creation_date', 'asc')
                ->get();
            $tecnicos = User::role('agent')->get(['id', 'name']);
        } else {
            // Only tickets from admin's department
            $tickets = Ticket::with(['department', 'priority', 'requestingUser', 'status'])
                ->whereNull('assigned_user')
                ->where('department_id', $departmentId)
                ->orderBy('creation_date', 'asc')
                ->get();
            // Only agents from the same department
            $tecnicos = User::role('agent')
                ->where('department_id', $departmentId)
                ->get(['id', 'name']);
        }

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

        $tecnico = User::find($request->tecnico_id);

        // Verificar que el técnico pertenezca al mismo departamento que el ticket
        if ($tecnico->department_id !== $ticket->department_id) {
            return back()->with('error', 'El técnico debe pertenecer al departamento del ticket.');
        }

        // Verificar que el ticket no esté ya asignado
        if ($ticket->assigned_user) {
            return back()->with('error', 'Este ticket ya está asignado a un técnico.');
        }

        $ticket->assigned_user = $tecnico->id;

        $statusInProgress = Status::where('name', 'En Proceso')->first();
        if ($statusInProgress) {
            $ticket->status_id = $statusInProgress->id;
        }

        $ticket->save();

        // Notificar al técnico
        $tecnico->notify(new TicketAssignedNotification($ticket));

        // Redirigir a la lista de pendientes (página de donde vino) con mensaje
        return redirect()->route('tickets.unassigned')->with('success', "Ticket {$ticket->code} asignado a {$tecnico->name} correctamente.");
    }



}
