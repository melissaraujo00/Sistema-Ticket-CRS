<?php

namespace App\Http\Controllers\Tickets;

use App\Http\Requests\CloseTicketRequest;
use App\Http\Requests\StoreInternalNoteRequest;
use App\Models\Department;
use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\Ticket;
use App\Models\TicketSolution;
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
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
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
            'statuses' => Status::all(['id', 'name']),
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
            'attachments',
            'ticketSolutions.solutionType',
            'ticketSolutions.attachments',
            'histories',
            'histories.user',
            'qualification'
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

        $resolvedTickets = Ticket::with(['requestingUser', 'department', 'status', 'assignedUser'])
            ->where('requesting_user', auth()->id())
            ->whereIn('status_id', [5, 7])
            ->whereDoesntHave('qualification')
            ->orderBy('created_at', 'desc')
            ->get();


        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
            'resolvedTickets' => $resolvedTickets
        ]);
    }

    /**
     * Display unassigned tickets (requires assign_tickets permission).
     */


    /**
     * Cancela un ticket si aún está pendiente de asignación.
     */
    public function cancel(CloseTicketRequest $request, Ticket $ticket)
    {
        // 1. Verificar que el ticket pertenezca al usuario autenticado
        if ($ticket->requesting_user !== auth()->id()) {
            abort(403, 'No puedes cancelar un ticket que no te pertenece.');
        }

        // 2. Verificar que el estado actual sea "Pendiente a asignación"
        if ($ticket->status->name !== 'Pendiente a asignación') {
            return redirect()->back()->with('error', 'Solo puedes cancelar tickets que aún no han sido asignados.');
        }

        // 3. Validar la justificación
        $validated = $request->validate(
            [
                'cancellation_reason' => 'required|string|min:10',
            ],
            [
                'cancellation_reason.required' => 'Debes indicar el motivo de la cancelación.',
                'cancellation_reason.min' => 'El motivo debe tener al menos 10 caracteres.',
            ]
        );
        // 4. Buscar el estado "Cancelado"
        $statusCancelado = \App\Models\Status::where('name', 'Cancelado')->first();
        if (!$statusCancelado) {
            $statusCancelado = \App\Models\Status::where('name', 'Cerrado')->firstOrFail();
        }

        // 5. Actualizar el ticket
        $ticket->update([
            'status_id' => $statusCancelado->id,
            'closing_date' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        // 6. Soft delete
        $ticket->delete();

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
            // Preparamos el optimizador de imágenes
            
            $manager = new ImageManager(new Driver());

            foreach ($request->file('attachments') as $file) {
                $extension = $file->getClientOriginalExtension();
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $mimeType = $file->getMimeType();

                // 1. EL RENOMBRADO FÁCIL
                $safeName = Str::slug($originalName);
                $newFileName = "{$ticket->code}_{$safeName}_" . Str::random(4) . ".{$extension}";
                $path = "tickets/{$ticket->id}/{$newFileName}";

                // 2. LA OPTIMIZACIÓN
                if (str_starts_with($mimeType, 'image/')) {
                    // Leemos la imagen
                    $img = $manager->read($file);

                    // La achicamos a un máximo de 1200px de ancho sin deformarla
                    $img->scaleDown(width: 1200);

                    // La guardamos con 75% de calidad (mantiene claridad, baja el peso)
                    $encoded = $img->toJpeg(75);

                    Storage::disk('public')->put($path, $encoded->toString());
                    $finalSize = strlen($encoded->toString());
                } else {
                    // Si es Word, Excel, etc., se guarda normal
                    $file->storeAs("tickets/{$ticket->id}", $newFileName, 'public');
                    $finalSize = $file->getSize();
                }

                // 3. GUARDAMOS EN BASE DE DATOS
                $ticket->attachments()->create([
                    'file_name' => $newFileName,
                    'file_path' => $path,
                    'file_type' => $mimeType,
                    'file_size' => $finalSize,
                ]);
                
            }
        }
        $department = Department::with('heads')->find($ticket->department_id);
        if ($department && $department->heads->count()) {
            foreach ($department->heads as $head) {
                $head->notify(new NewTicketNotification($ticket));
            }
        }

        $headIds = $department ? $department->heads->pluck('id') : collect();
        $globalAdmins = \App\Models\User::role(['admin', 'superadmin'])->get();

        foreach ($globalAdmins as $admin) {
            if (!$headIds->contains($admin->id)) {
                $admin->notify(new NewTicketNotification($ticket));
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
