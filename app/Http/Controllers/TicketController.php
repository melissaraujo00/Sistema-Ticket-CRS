<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\Priority;
use App\Models\SlaPlan;
use App\Models\Status;
use App\Models\Ticket;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
     public function index()
    {
        $tickets = Ticket::where('requesting_user', auth()->id())->get();
        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo ticket.
     */
    public function create()
    {
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
     * Guarda el ticket en la base de datos.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'department_id'  => 'required|exists:departments,id',
        'division_id'    => 'required|exists:divisions,id',
        'help_topic_id'  => 'required|exists:help_topics,id',
        'subject'        => 'required|string|max:200',
        'message'        => 'required|string',
        'attach'         => 'nullable|file|max:5120', // 5 MB
    ]);

    // Obtener el tema de ayuda y sus relaciones
    $helpTopic = HelpTopic::with('priority.slaPlan')->findOrFail($validated['help_topic_id']);
    $priority = $helpTopic->priority;
    $slaPlan = $priority->slaPlan;

    $statusOpen = Status::where('name', 'open')->firstOrFail();

    // Generar código único
    $code = $this->generateTicketCode();

    $creationDate = Carbon::now();
    $expirationDate = $creationDate->copy()->addHours($slaPlan->response_time_hours);

    // Manejar archivo adjunto
    $attachPath = null;
    if ($request->hasFile('attach')) {
        $attachPath = $request->file('attach')->store('tickets', 'public');
    }

    $ticket = Ticket::create([
        'code'            => $code,
        'creation_date'   => $creationDate,
        'email'           => auth()->user()->email,
        'subject'         => $validated['subject'],
        'message'         => $validated['message'],
        'attach'          => $attachPath,
        'expiration_date' => $expirationDate,
        'closing_date'    => null,
        'requesting_user' => auth()->id(),
        'assigned_user'   => null,
        'help_topic_id'   => $helpTopic->id,
        'priority_id'     => $priority->id,
        'sla_plan_id'     => $slaPlan->id,
        'department_id'   => $validated['department_id'],
        'status_id'       => $statusOpen->id,
    ]);

    return redirect()->route('tickets.index')->with('success', 'Ticket creado correctamente');
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
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket)
    {
        //
    }
}
