<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketSolution;
use App\Models\User;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        $statusCerrado = null;
        $statusEnProceso = null;
        $statusPendienteRevision = null;

        foreach ($statuses as $name => $status) {
            $nameLower = strtolower($name);
            if (strpos($nameLower, 'cerrado') !== false || strpos($nameLower, 'finalizado') !== false || strpos($nameLower, 'resuelto') !== false) {
                $statusCerrado = $status;
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

        $query = Ticket::with(['priority', 'department', 'status', 'requestingUser'])
            ->where('assigned_user', $agent->id);

        if ($statusPendienteRevision) {
            $query->where('status_id', '!=', $statusPendienteRevision->id);
        }

        $tickets = $query->get();

        $totalAsignados = $tickets->count();
        $totalResueltos = $statusCerrado ? $tickets->where('status_id', $statusCerrado->id)->count() : 0;
        $totalEnProceso = $statusEnProceso ? $tickets->where('status_id', $statusEnProceso->id)->count() : 0;
        $totalEnCola = $statusCerrado ? $tickets->where('status_id', '!=', $statusCerrado->id)->count() : $totalAsignados;
        $tasaResolucion = $totalAsignados > 0 ? ($totalResueltos / $totalAsignados) * 100 : 0;

        // Preparar datos de tickets asignados
        $ticketsAsignados = $tickets->map(function ($ticket) {
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

        // Preparar historial de finalizados
        $historialFinalizados = $statusCerrado
            ? $tickets->where('status_id', $statusCerrado->id)->sortByDesc('closing_date')->values()
            : collect([]);

        return response()->json([
            'tickets_asignados' => $ticketsAsignados,
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
            'histories'
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
            'temas_de_ayuda' => $ticket->helpTopic->name ?? 'N/A',
            'departamento_solicitante' => $ticket->department->name ?? 'N/A',
            'solicitante' => $ticket->requestingUser->name ?? 'N/A',
            'problema' => $ticket->subject,
            'detalles_del_problema' => $ticket->message,
            'adjuntos' => $ticket->attach,
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

        $pathsAdjuntos = [];

        // Laravel convierte adjuntos[] a adjuntos_ en el request cuando se usa FormData
        if ($request->hasFile('adjuntos_')) {
            foreach ($request->file('adjuntos_') as $file) {
                // Validar tamaño de archivo individual
                if ($file->getSize() > 10240 * 1024) { // 10MB
                    return response()->json([
                        'message' => 'El archivo ' . $file->getClientOriginalName() . ' excede el tamaño máximo de 10MB.'
                    ], 422);
                }
                $pathsAdjuntos[] = $file->store('diagnosticos', 'public');
            }
        } elseif ($request->hasFile('adjuntos')) {
            foreach ($request->file('adjuntos') as $file) {
                // Validar tamaño de archivo individual
                if ($file->getSize() > 10240 * 1024) { // 10MB
                    return response()->json([
                        'message' => 'El archivo ' . $file->getClientOriginalName() . ' excede el tamaño máximo de 10MB.'
                    ], 422);
                }
                $pathsAdjuntos[] = $file->store('diagnosticos', 'public');
            }
        }

        // Validar que se hayan subido archivos
        if (empty($pathsAdjuntos)) {
            return response()->json([
                'message' => 'Debe adjuntar al menos un archivo como evidencia del diagnóstico.'
            ], 422);
        }

        // Preparar datos para inserción
        $attachJson = json_encode($pathsAdjuntos);
        $diagnosticType = 'diagnostico_' . strtolower(str_replace(' ', '_', $request->tipo_diagnostico));

        // Log para depuración
        Log::info('Insertando diagnóstico:', [
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'observacion' => $request->observacion,
            'attach_json' => $attachJson,
            'type' => $diagnosticType,
            'files_count' => count($pathsAdjuntos)
        ]);

        // Usar DB::insert para evitar problemas con el modelo TicketSolution
        $insertResult = DB::table('ticket_solutions')->insert([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'message' => $request->observacion,
            'date' => now()->format('Y-m-d'),
            'attach' => $attachJson, // Guardar como Array JSON
            'type' => $diagnosticType,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::info('Resultado de inserción de diagnóstico:', ['result' => $insertResult]);

        // Actualizar el estado del ticket para que el jefe lo revise
        $estadoRevision = Status::firstOrCreate(['name' => 'Pendiente Revisión']);
        $ticket->status_id = $estadoRevision->id;
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
}
