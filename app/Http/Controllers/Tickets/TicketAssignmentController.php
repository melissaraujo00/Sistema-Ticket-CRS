<?php

namespace App\Http\Controllers\Tickets;

use App\Enums\ActionTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminCloseTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Department;
use App\Models\Division;
use App\Models\HelpTopic;
use App\Models\Priority;
use App\Models\SlaPlan;
use App\Models\Status;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

// ... imports

class TicketAssignmentController extends Controller
{
   public function unassigned()
    {
        if (!auth()->user()->can('assign_tickets')) {
        abort(403, 'No tienes permiso para ver tickets pendientes de asignación.');
        }

        $user = auth()->user();
        $departmentId = $user->department_id;

        // Consulta base: Cargamos la relación 'status'
        $query = Ticket::with(['department', 'helpTopic.division', 'priority', 'requestingUser', 'status', 'assignedUser'])
            ->orderBy('creation_date', 'asc')
            ->whereHas('status', function($q) {
            $q->where('name', '!=', 'Cerrado');
        });

        if (!$user->hasRole('superadmin')) {
            $query->where('department_id', $departmentId);
        }

        // ELIMINAMOS: ->whereNull('assigned_user') para que permanezcan en la lista
        $tickets = $query->get();

        // Obtener técnicos
        $tecnicosQuery = User::role('agent');
        if (!$user->hasRole('superadmin')) {
            $tecnicosQuery->where('department_id', $departmentId);
        }
        $tecnicos = $tecnicosQuery->get(['id', 'name']);

        return Inertia::render('tickets/unassigned', [
            'tickets' => $tickets,
            'tecnicos' => $tecnicos,
            'departments' => Department::all(['id', 'name']),
            'divisions' => Division::all(['id', 'name', 'department_id']),
            'helpTopics'  => HelpTopic::all(['id', 'name_topic', 'division_id']),
            'slaPlans'    => SlaPlan::all(['id', 'name']),
            'priorities'  => Priority::all(['id', 'name']),
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        // El Form Request ya hizo todas las validaciones complejas
        $validated = $request->validated();

        $seCambioDepartamento = intval($ticket->department_id) !== intval($validated['department_id']);

        if ($seCambioDepartamento) {
            // Guardamos los datos anteriores ANTES de actualizar el ticket
            $departamentoAnterior = $ticket->department_id;
            $tecnicoAnterior = $ticket->assigned_user;

            $statusPendiente = Status::where('name', 'Pendiente a asignación')->firstOrFail();

            $ticket->update([
                'department_id'   => $validated['department_id'],
                'help_topic_id'   => $validated['help_topic_id'] ?? $ticket->help_topic_id,
                'status_id'       => $statusPendiente->id,
                'assigned_user'   => null,
                'priority_id'     => null,
                'sla_plan_id'     => null,
                'expiration_date' => null,
            ]);

            TicketHistory::create([
                'ticket_id'           => $ticket->id,
                'user_id'             => auth()->id(),
                'action_type'         => ActionTypeEnum::STATUS_CHANGED,
                'internal_note'       => 'Ticket transferido a otro departamento para su evaluación.',
                'previous_department' => $departamentoAnterior,
                'assigned_user'       => $tecnicoAnterior,
            ]);

            return redirect()->route('tickets.unassigned')->with('success', 'Ticket enviado al nuevo departamento. Queda pendiente de asignación allí.');
        }

        // --- LÓGICA DE ASIGNACIÓN NORMAL (Restaurada) ---

        $statusAsignado = Status::where('name', 'Asignado')->firstOrFail();

        $updateData = [
            'help_topic_id' => $validated['help_topic_id'],
            'priority_id'   => $validated['priority_id'],
            'sla_plan_id'   => $validated['sla_plan_id'],
            'assigned_user' => $validated['assigned_user'],
            'status_id'     => $statusAsignado->id,
        ];

        // Calcular fecha de expiración sumando las horas de gracia del SLA
        if (!empty($validated['sla_plan_id'])) {
            $slaPlan = SlaPlan::findOrFail($validated['sla_plan_id']);
            $updateData['expiration_date'] = Carbon::parse($ticket->creation_date)->addHours($slaPlan->grace_time_hours);
        }

        $ticket->update($updateData);

        return redirect()->back()->with('success', 'Ticket asignado y actualizado correctamente.');
    }
    public function adminClose(AdminCloseTicketRequest $request, Ticket $ticket)
    {
        $validated = $request->validated();
        $statusCerrado = Status::where('name', 'Cerrado')->firstOrFail();

        DB::beginTransaction();
        try {
            $ticket->update([
                'status_id' => $statusCerrado->id,
                'closing_date' => now(),
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'action_type' => ActionTypeEnum::STATUS_CHANGED,
                'internal_note' => $validated['internal_note'],
                'previous_department' => $ticket->department_id,
                'assigned_user' => $ticket->assigned_user,
            ]);

            DB::commit();
            return redirect()->route('tickets.unassigned')->with('success', 'Ticket cerrado exitosamente y nota agregada al historial.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Ocurrió un error al cerrar el ticket.');
        }
    }


    public function showAsignador(Ticket $ticket)
    {
        $user = auth()->user();

        // 1. Validar que tenga el permiso de asignador
        if (!$user->can('assign_tickets')) {
            abort(403, 'No tienes permiso para gestionar asignaciones.');
        }

        // 2. Si no es superadmin, validar que el ticket sea de su departamento
        if (!$user->hasRole('superadmin') && $ticket->department_id !== $user->department_id) {
            abort(403, 'Este ticket no pertenece a tu departamento.');
        }

        // 3. Cargar las relaciones necesarias (Una sola vez)
        $ticket->load([
            'department',
            'helpTopic.division',
            'priority',
            'requestingUser',
            'status',
            'assignedUser',
            'histories.user' // Esto incluye 'histories' automáticamente
        ]);

        // 4. Obtener técnicos del departamento (Faltaba hacer el ->get())
        $tecnicosQuery = \App\Models\User::role('agent');
        if (!$user->hasRole('superadmin')) {
            $tecnicosQuery->where('department_id', $user->department_id);
        }
        $tecnicos = $tecnicosQuery->get(['id', 'name']);

        // 5. Renderizar la vista con TODAS las variables necesarias para el modal
        return Inertia::render('tickets/showAsignador', [
            'ticket'      => $ticket,
            'tecnicos'    => $tecnicos,
            'departments' => Department::all(['id', 'name']),
            'divisions'   => Division::all(['id', 'name', 'department_id']),
            'helpTopics'  => HelpTopic::all(['id', 'name_topic', 'division_id']),
            'slaPlans'    => SlaPlan::all(['id', 'name']),
            'priorities'  => Priority::all(['id', 'name']),
        ]);
    }
}
