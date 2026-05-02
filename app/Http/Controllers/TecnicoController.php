<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketIncidentRequest;
use App\Models\Ticket;
use App\Models\TicketSolution;
use App\Models\User;
use App\Models\Status;
use App\Models\Attachment;
use App\Models\SolutionType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Notifications\TicketUnresolvedNotification;
use App\Models\TicketHistory;
use App\Models\TicketIncident;
use App\Enums\ActionTypeEnum;
use App\Enums\TicketStatusEnum;


class TecnicoController extends Controller
{
    private $statusCache = [];

    private function getStatusByName($pattern)
    {
        if (!isset($this->statusCache[$pattern])) {
            $this->statusCache[$pattern] = Status::where('name', 'like', $pattern)->first();
        }
        return $this->statusCache[$pattern];
    }

    private function getCachedStatuses()
    {
        if (empty($this->statusCache)) {
            $statuses = Status::all();
            foreach ($statuses as $status) {
                $this->statusCache[strtolower($status->name)] = $status;
            }
        }
        return $this->statusCache;
    }
    /**
     * Obtener datos del dashboard
     */
    public function dashboardData(): JsonResponse
    {
        $agent = Auth::user();
        $statuses = $this->getCachedStatuses();

        $terminalStatuses = [];
        $activeStatuses = [];
        $statusEnProceso = null;
        $statusPendienteRevision = null;

        foreach ($statuses as $name => $status) {
            $nameLower = strtolower($name);

            // Definir estados terminales (Cerrados, Resueltos, No Resueltos)
            if (
                strpos($nameLower, 'cerrado') !== false ||
                strpos($nameLower, 'finalizado') !== false ||
                strpos($nameLower, 'resuelto') !== false ||
                strpos($nameLower, 'no resuelto') !== false
            ) {
                $terminalStatuses[] = $status->id;
            } else {
                $activeStatuses[] = $status->id;
            }

            if (strpos($nameLower, 'proceso') !== false || strpos($nameLower, 'progreso') !== false) {
                $statusEnProceso = $status;
            }
            if (strpos($nameLower, 'pendiente') !== false && strpos($nameLower, 'revision') !== false) {
                $statusPendienteRevision = $status;
            }
        }

        if (!$statusPendienteRevision) {
            $statusPendienteRevision = Status::where('name', 'Pendiente Revisión')->first();
        }

        $query = Ticket::with(['priority', 'department', 'status', 'requestingUser', 'ticketSolutions', 'incidents'])
            ->where('assigned_user', $agent->id);

        if ($statusPendienteRevision) {
            $query->where('status_id', '!=', $statusPendienteRevision->id);
        }

        $tickets = $query->get();

        // 1. Tickets Activos (Los que el técnico tiene pendientes de trabajar)
        $ticketsActivos = $tickets->whereIn('status_id', $activeStatuses);

        // 2. Historial (Tickets que ya pasaron por un diagnóstico final o reporte de incidencia)
        $historialFinalizados = $tickets->whereIn('status_id', $terminalStatuses)
            ->sortByDesc('updated_at')
            ->values();

        // Estadísticas precisas
        $totalAsignados = $tickets->count();
        // Solo contamos como "Resueltos" los que NO son "No Resueltos"
        $totalResueltos = $tickets->filter(function ($t) {
            $name = strtolower($t->status->name);
            return (strpos($name, 'resuelto') !== false || strpos($name, 'cerrado') !== false)
                && strpos($name, 'no resuelto') === false;
        })->count();

        $totalEnProceso = $statusEnProceso ? $tickets->where('status_id', $statusEnProceso->id)->count() : 0;
        $totalEnCola = $ticketsActivos->count();
        $tasaResolucion = $totalAsignados > 0 ? ($totalResueltos / $totalAsignados) * 100 : 0;

        // Mapear tickets activos para la tabla principal
        $ticketsMapeados = $ticketsActivos->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'asunto' => $ticket->subject,
                'departamento' => $ticket->department->name ?? 'N/A',
                'estado' => $ticket->status->name ?? 'N/A',
                'prioridad' => $ticket->priority->name ?? 'N/A',
                'creado_por' => $ticket->requestingUser->name ?? 'N/A',
                'fecha_creacion' => $ticket->creation_date,
                'tiene_diagnostico' => $ticket->ticketSolutions->count() > 0 || $ticket->incidents->count() > 0
            ];
        })->values();

        return response()->json([
            'tickets_asignados' => $ticketsMapeados,
            'historial_finalizados' => $historialFinalizados,
            'estadisticas' => [
                'tasa_resolucion_porcentaje' => round($tasaResolucion, 2),
                'total_tickets_cola' => $totalEnCola,
                'total_tickets_proceso' => $totalEnProceso,
                'total_tickets_asignados' => $totalAsignados,
                'total_tickets_resueltos' => $totalResueltos
            ]
        ]);
    }
    public function totalTicketsAsignados(): JsonResponse
    {
        $agent = Auth::user();
        $total = Ticket::where('assigned_user', $agent->id)->count();

        return response()->json([
            'total_asignados' => $total
        ]);
    }

    /**
     * Obtener el total de tickets en proceso del técnico
     */
    public function totalTicketsEnProceso(): JsonResponse
    {
        $agent = Auth::user();

        $statusEnProceso = Status::where('name', 'like', '%proceso%')
            ->orWhere('name', 'like', '%Proceso%')
            ->orWhere('name', 'like', '%progreso%')
            ->first();

        $total = Ticket::where('assigned_user', $agent->id)
            ->when($statusEnProceso, function ($query) use ($statusEnProceso) {
                return $query->where('status_id', $statusEnProceso->id);
            })
            ->count();

        return response()->json([
            'total_en_proceso' => $total
        ]);
    }

    /**
     * Obtener el total de tickets resueltos por el técnico
     */
    public function totalTicketsResueltos(): JsonResponse
    {
        $agent = Auth::user();

        $statusResuelto = Status::where('name', 'like', '%resuelto%')
            ->orWhere('name', 'like', '%Resuelto%')
            ->orWhere('name', 'like', '%cerrado%')
            ->orWhere('name', 'like', '%Cerrado%')
            ->orWhere('name', 'like', '%finalizado%')
            ->first();

        $total = Ticket::where('assigned_user', $agent->id)
            ->when($statusResuelto, function ($query) use ($statusResuelto) {
                return $query->where('status_id', $statusResuelto->id);
            })
            ->count();

        return response()->json([
            'total_resueltos' => $total
        ]);
    }

    /**
     * Obtener el historial de tickets finalizados (cerrados) del técnico
     */
    public function historialTicketsFinalizados(): JsonResponse
    {
        $agent = Auth::user();

        $statusCerrado = Status::where('name', 'like', '%cerrado%')
            ->orWhere('name', 'like', '%Cerrado%')
            ->orWhere('name', 'like', '%finalizado%')
            ->orWhere('name', 'like', '%resuelto%')
            ->first();

        $tickets = Ticket::with(['priority', 'department', 'status'])
            ->where('assigned_user', $agent->id)
            ->when($statusCerrado, function ($query) use ($statusCerrado) {
                return $query->where('status_id', $statusCerrado->id);
            })
            ->orderBy('closing_date', 'desc')
            ->get();

        return response()->json([
            'historial_finalizados' => $tickets
        ]);
    }

    /**
     * Obtener la tasa de resolución de tickets en porcentaje
     */
    public function tasaResolucion(): JsonResponse
    {
        $agent = Auth::user();

        $totalAsignados = Ticket::where('assigned_user', $agent->id)->count();

        if ($totalAsignados === 0) {
            return response()->json([
                'tasa_resolucion' => 0,
                'total_resueltos' => 0,
                'total_asignados' => 0
            ]);
        }

        $statusResuelto = Status::where('name', 'like', '%resuelto%')
            ->orWhere('name', 'like', '%cerrado%')
            ->orWhere('name', 'like', '%finalizado%')
            ->first();

        $totalResueltos = Ticket::where('assigned_user', $agent->id)
            ->when($statusResuelto, function ($query) use ($statusResuelto) {
                return $query->where('status_id', $statusResuelto->id);
            })
            ->count();

        $tasa = ($totalResueltos / $totalAsignados) * 100;

        return response()->json([
            'tasa_resolucion' => round($tasa, 2),
            'total_resueltos' => $totalResueltos,
            'total_asignados' => $totalAsignados
        ]);
    }

    /**
     * Obtener todos los tickets que están en cola (no cerrados)
     */
    public function ticketsEnCola(): JsonResponse
    {
        $agent = Auth::user();

        $statusCerrado = Status::where('name', 'like', '%cerrado%')
            ->orWhere('name', 'like', '%Cerrado%')
            ->orWhere('name', 'like', '%finalizado%')
            ->orWhere('name', 'like', '%resuelto%')
            ->first();

        $tickets = Ticket::with(['priority', 'department', 'status'])
            ->where('assigned_user', $agent->id)
            ->when($statusCerrado, function ($query) use ($statusCerrado) {
                return $query->where('status_id', '!=', $statusCerrado->id);
            })
            ->orderBy('creation_date', 'desc')
            ->get();

        return response()->json([
            'tickets_en_cola' => $tickets
        ]);
    }

    /**
     * Obtener todos los tickets que están en proceso
     */
    public function ticketsEnProceso(): JsonResponse
    {
        $agent = Auth::user();

        $statusEnProceso = Status::where('name', 'like', '%proceso%')
            ->orWhere('name', 'like', '%Proceso%')
            ->orWhere('name', 'like', '%progreso%')
            ->first();

        $tickets = Ticket::with(['priority', 'department', 'status'])
            ->where('assigned_user', $agent->id)
            ->when($statusEnProceso, function ($query) use ($statusEnProceso) {
                return $query->where('status_id', $statusEnProceso->id);
            })
            ->orderBy('creation_date', 'desc')
            ->get();

        return response()->json([
            'tickets_en_proceso' => $tickets
        ]);
    }

    /**
     * Obtener los tickets asignados con campos específicos
     */
    public function ticketsAsignados(): JsonResponse
    {
        $agent = Auth::user();

        $tickets = Ticket::with(['priority', 'department', 'status', 'requestingUser'])
            ->where('assigned_user', $agent->id)
            ->get(['id', 'subject', 'department_id', 'status_id', 'priority_id', 'requesting_user', 'creation_date']);

        $ticketsTransformados = $tickets->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'asunto' => $ticket->subject,
                'departamento' => $ticket->department->name ?? 'N/A',
                'estado' => $ticket->status->name ?? 'N/A',
                'prioridad' => $ticket->priority->name ?? 'N/A',
                'creado_por' => $ticket->requestingUser->name ?? 'N/A',
                'fecha_creacion' => $ticket->creation_date
            ];
        });

        return response()->json([
            'tickets_asignados' => $ticketsTransformados
        ]);
    }

    /**
     * Ver un ticket específico con todos sus detalles
     */
    public function verTicket($id): JsonResponse
    {
        $agent = Auth::user();

        $ticket = Ticket::with([
            'status',
            'priority',
            'slaPlan',
            'requestingUser',
            'assignedUser',
            'helpTopic',
            'department',
            'histories',
            'attachments',
            'ticketSolutions.attachments',
            'ticketSolutions.solutionType',
            'incidents.user',
            'incidents.attachments'
        ])
            ->where('id', $id)
            ->where('assigned_user', $agent->id)
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket no encontrado o no tienes permiso para verlo'
            ], 404);
        }

        $ticketDetallado = [
            'id' => $ticket->id,
            'estado_del_ticket' => $ticket->status->name ?? 'N/A',
            'prioridad' => $ticket->priority->name ?? 'N/A',
            'fecha_creacion' => $ticket->creation_date,
            'asignado' => $ticket->assignedUser->name ?? 'N/A',
            'plan_sla' => $ticket->slaPlan->name ?? 'N/A',
            'fecha_limite' => $ticket->expiration_date,
            'nombre' => $ticket->requestingUser->name ?? 'N/A',
            'email' => $ticket->email,
            'telefono' => $ticket->requestingUser->phone_number ?? 'N/A',
            'temas_de_ayuda' => $ticket->helpTopic->name_topic ?? 'N/A',
            'departamento_solicitante' => $ticket->department->name ?? 'N/A',
            'solicitante' => $ticket->requestingUser->name ?? 'N/A',
            'problema' => $ticket->subject,
            'detalles_del_problema' => $ticket->message,
            'adjuntos' => $ticket->attachments->map(fn($a) => [
                'name' => $a->file_name,
                'path' => $a->file_path,
                'type' => $a->file_type
            ]),
            'soluciones' => $ticket->ticketSolutions->map(fn($s) => [
                'id' => $s->id,
                'mensaje' => $s->message,
                'fecha' => $s->date,
                'tipo' => $s->solutionType->name ?? 'N/A',
                'adjuntos' => $s->attachments->map(fn($a) => [
                    'name' => $a->file_name,
                    'path' => $a->file_path,
                    'type' => $a->file_type
                ])
            ]),
            'incidencias' => $ticket->incidents->map(function ($inc) {
                return [
                    'avances' => $inc->advances,
                    'justificacion' => $inc->justification,
                    'fecha' => $inc->created_at,
                    'tecnico' => $inc->user->name ?? 'N/A',
                    'adjuntos' => $inc->attachments->map(function ($adj) {
                        return [
                            'name' => $adj->file_name,
                            'path' => $adj->file_path,
                            'type' => $adj->file_type
                        ];
                    })
                ];
            }),
            'area_del_agent' => $ticket->assignedUser->department->name ?? 'N/A',
            'historial' => $ticket->histories->map(function ($history) {
                return [
                    'fecha' => $history->created_at,
                    'accion' => $history->action,
                    'detalles' => $history->details,
                    'usuario' => $history->user->name ?? 'Sistema'
                ];
            })
        ];

        return response()->json([
            'ticket' => $ticketDetallado
        ]);
    }

    /**
     * Guardar el diagnóstico de un ticket
     */
    public function guardarDiagnostico(Request $request, $id): JsonResponse
    {
        $request->validate([
            'tipo_diagnostico' => 'required|string',
            'observacion' => 'required|string',
        ]);

        $agent = Auth::user();

        $ticket = Ticket::where('id', $id)
            ->where('assigned_user', $agent->id)
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket no encontrado o no tienes permiso.'
            ], 404);
        }

        $solutionType = SolutionType::firstOrCreate(
            ['name' => $request->tipo_diagnostico],
            ['description' => 'Creado desde diagnóstico técnico']
        );

        $solution = TicketSolution::create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'message' => $request->observacion,
            'date' => now(),
            'solution_type_id' => $solutionType->id,
        ]);

        $filesProcessed = 0;

        // Manejar adjuntos
        $inputNames = ['adjuntos', 'adjuntos_'];
        foreach ($inputNames as $inputName) {
            if ($request->hasFile($inputName)) {
                foreach ($request->file($inputName) as $file) {
                    if ($file->getSize() > 10240 * 1024) {
                        return response()->json([
                            'message' => 'El archivo ' . $file->getClientOriginalName() . ' excede el tamaño máximo de 10MB.'
                        ], 422);
                    }

                    $path = $file->store('diagnosticos', 'public');

                    $solution->attachments()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);

                    $filesProcessed++;
                }
            }
        }

        if ($filesProcessed === 0) {
            return response()->json([
                'message' => 'Debe adjuntar al menos un archivo como evidencia del diagnóstico.'
            ], 422);
        }

        Log::info('Diagnóstico guardado:', [
            'ticket_id' => $ticket->id,
            'solution_id' => $solution->id,
            'files_count' => $filesProcessed
        ]);

        $estadoResuelto = Status::where('name', 'like', '%Resuelto%')
            ->orWhere('name', 'like', '%resuelto%')
            ->first();

        if (!$estadoResuelto) {
            $estadoResuelto = Status::firstOrCreate(['name' => 'Resuelto']);
        }

        $ticket->status_id = $estadoResuelto->id;
        $ticket->save();

        return response()->json([
            'message' => 'Diagnóstico guardado exitosamente.',
            'status_id' => $ticket->status_id
        ]);
    }

    /**
     * Obtener estadísticas generales del técnico
     */
    public function misEstadisticas(): JsonResponse
    {
        $agent = Auth::user();

        $statusCerrado = Status::where('name', 'like', '%cerrado%')
            ->orWhere('name', 'like', '%finalizado%')
            ->orWhere('name', 'like', '%resuelto%')
            ->first();

        $statusEnProceso = Status::where('name', 'like', '%proceso%')
            ->orWhere('name', 'like', '%progreso%')
            ->first();

        $totalAsignados = Ticket::where('assigned_user', $agent->id)->count();

        $totalResueltos = $statusCerrado
            ? Ticket::where('assigned_user', $agent->id)->where('status_id', $statusCerrado->id)->count()
            : 0;

        $totalEnProceso = $statusEnProceso
            ? Ticket::where('assigned_user', $agent->id)->where('status_id', $statusEnProceso->id)->count()
            : 0;

        $totalEnCola = $statusCerrado
            ? Ticket::where('assigned_user', $agent->id)->where('status_id', '!=', $statusCerrado->id)->count()
            : $totalAsignados;

        $tasaResolucion = $totalAsignados > 0 ? ($totalResueltos / $totalAsignados) * 100 : 0;

        return response()->json([
            'estadisticas' => [
                'tasa_resolucion_porcentaje' => round($tasaResolucion, 2),
                'total_tickets_cola' => $totalEnCola,
                'total_tickets_proceso' => $totalEnProceso,
                'total_tickets_asignados' => $totalAsignados,
                'total_tickets_resueltos' => $totalResueltos
            ]
        ]);
    }
    /**
     * Acción cuando el técnico no puede resolver el ticket
     */
    public function noPuedeResolver(StoreTicketIncidentRequest $request, $id): JsonResponse
    {
        $agent = Auth::user();

        $ticket = Ticket::with('requestingUser')
            ->where('id', $id)
            ->where('assigned_user', $agent->id)
            ->first();

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket no encontrado o no tienes permiso.'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $incident = TicketIncident::create([
                'ticket_id' => $ticket->id,
                'user_id' => $agent->id,
                'department_id' => $ticket->department_id,
                'advances' => $request->avances,
                'justification' => $request->justificacion,
            ]);

            if ($request->hasFile('adjuntos')) {
                foreach ($request->file('adjuntos') as $file) {
                    $path = $file->store('evidencias_incidencias', 'public');
                    $incident->attachments()->create([
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            $statusName = TicketStatusEnum::UNRESOLVED->value;
            $estadoNoResuelto = Status::firstOrCreate(['name' => $statusName]);

            $ticket->status_id = $estadoNoResuelto->id;
            $ticket->save();

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $agent->id,
                'action_type' => ActionTypeEnum::STATUS_CHANGED,
                'internal_note' => $request->justificacion,
                'previous_department' => $ticket->department_id,
                'assigned_user' => $ticket->assigned_user,
            ]);

            // 7. Enviar notificación profesional al usuario solicitante
            if ($ticket->requestingUser) {
                $ticket->requestingUser->notify(new TicketUnresolvedNotification(
                    $ticket,
                    $request->justificacion,
                    $agent,
                    $request->avances
                ));
            }

            DB::commit();

            return response()->json([
                'message' => 'El reporte de incidencia ha sido enviado exitosamente.',
                'status_id' => $ticket->status_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error crítico en noPuedeResolver:', [
                'ticket_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Ocurrió un error al procesar el reporte.'
            ], 500);
        }
    }
}
