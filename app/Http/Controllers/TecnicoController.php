<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketIncidentRequest;
use App\Http\Requests\StoreDiagnosisRequest;
use App\Services\TecnicoService;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TecnicoController extends Controller
{
    /**
     * Inyecta el TecnicoService a través del constructor.
     */
    public function __construct(protected TecnicoService $service) {}

    /**
     * Retorna el conjunto completo de datos para el dashboard del técnico.
     */
    public function dashboardData(Request $request): JsonResponse
    {
        $data = $this->service->getDashboardData($request);
        return response()->json($data);
    }

    /**
     * Obtener el total de tickets asignados al técnico
     */
    public function totalTicketsAsignados(): JsonResponse
    {
        $total = $this->service->getTotalTicketsAsignados();
        return response()->json([
            'total_asignados' => $total
        ]);
    }

    /**
     * Obtener el total de tickets en proceso para el técnico
     */
    public function totalTicketsEnProceso(): JsonResponse
    {
        $total = $this->service->getTotalTicketsEnProceso();
        return response()->json([
            'total_en_proceso' => $total
        ]);
    }

    /**
     * Obtener el total de tickets resueltos por el técnico
     */
    public function totalTicketsResueltos(): JsonResponse
    {
        $total = $this->service->getTotalTicketsResueltos();
        return response()->json([
            'total_resueltos' => $total
        ]);
    }

    /**
     * Obtener el historial de tickets finalizados (cerrados) del técnico
     */
    public function historialTicketsFinalizados(): JsonResponse
    {
        $tickets = $this->service->getHistorialTicketsFinalizados();
        return response()->json([
            'historial_finalizados' => $tickets
        ]);
    }

    /**
     * Obtener la tasa de resolución de tickets en porcentaje
     */
    public function tasaResolucion(): JsonResponse
    {
        $data = $this->service->getTasaResolucion();
        return response()->json($data);
    }

    /**
     * Obtener todos los tickets que están en cola (no cerrados)
     */
    public function ticketsEnCola(): JsonResponse
    {
        $tickets = $this->service->getTicketsEnCola();
        return response()->json([
            'tickets_en_cola' => $tickets
        ]);
    }

    /**
     * Obtener todos los tickets que están en proceso
     */
    public function ticketsEnProceso(): JsonResponse
    {
        $tickets = $this->service->getTicketsEnProceso();
        return response()->json([
            'tickets_en_proceso' => $tickets
        ]);
    }

    /**
     * Obtener los tickets asignados con campos específicos
     */
    public function ticketsAsignados(): JsonResponse
    {
        $tickets = $this->service->getTicketsAsignadosSimple();
        return response()->json([
            'tickets_asignados' => $tickets
        ]);
    }

    /**
     * Ver un ticket específico con todos sus detalles.
     * Automatiza el paso a "En Proceso" al visualizarlo.
     */
    public function verTicket($id): JsonResponse
    {
        $ticket = $this->service->getTicketDetails($id);

        if (!$ticket) {
            return response()->json([
                'message' => 'Ticket no encontrado o no tienes permiso para verlo'
            ], 404);
        }

        return response()->json([
            'ticket' => $ticket
        ]);
    }

    /**
     * Guarda el diagnóstico técnico utilizando el Form Request para validación.
     */
    public function guardarDiagnostico(StoreDiagnosisRequest $request, $id): JsonResponse
    {
        try {
            $result = $this->service->guardarDiagnostico($request, $id);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() >= 400 && $e->getCode() <= 500 ? $e->getCode() : 422);
        }
    }

    /**
     * Obtener estadísticas generales del técnico
     */
    public function misEstadisticas(): JsonResponse
    {
        $data = $this->service->getMisEstadisticas();
        return response()->json($data);
    }

    /**
     * Acción cuando el técnico no puede resolver el ticket
     */
    public function noPuedeResolver(StoreTicketIncidentRequest $request, $id): JsonResponse
    {
        try {
            $result = $this->service->noPuedeResolver($request->validated('internal_note'), $id);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() >= 400 && $e->getCode() <= 500 ? $e->getCode() : 500);
        }
    }

    /**
     * Descargar un adjunto de forma segura
     */
    public function descargarAdjunto($id)
    {
        $attachment = Attachment::findOrFail($id);
        $path = storage_path('app/public/' . $attachment->file_path);

        if (!file_exists($path)) {
            Log::error("Archivo no encontrado en la ruta: " . $path);
            abort(404, 'El archivo físico no existe en el servidor.');
        }

        return response()->download($path, $attachment->file_name);
    }
}
