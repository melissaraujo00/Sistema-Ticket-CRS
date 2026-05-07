<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $service) {}

    /**
     * Renderiza el dashboard con todos los datos.
     *
     * Query params opcionales:
     *   ?from=YYYY-MM-DD  — inicio del rango de fechas
     *   ?to=YYYY-MM-DD    — fin del rango de fechas
     */
    public function index(Request $request): Response
    {
        $from = $request->query('from');
        $to   = $request->query('to');

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'kpis'          => $this->service->getKpis($from, $to),
                'ticketsByMonth'=> $this->service->getTicketsByMonth($from, $to),
                'byCategory'    => $this->service->getByCategory($from, $to),
                'byPriority'    => $this->service->getByPriority($from, $to),
                'resumen'       => $this->service->getResumen($from, $to),
                'agentes'       => $this->service->getTopAgentes($from, $to),
                'tickets'       => $this->service->getActiveTickets($from, $to),
            ],
            'filters' => [
                'from' => $from ?? '',
                'to'   => $to   ?? '',
            ],
        ]);
    }
}