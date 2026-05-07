<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\Qualification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // ─── KPI cards ────────────────────────────────────────────────────────────

    /**
     * Retorna los 4 contadores principales.
     * Filtra por rango de fechas (creation_date) si se proporcionan.
     */
    public function getKpis(?string $from, ?string $to): array
    {
        $base = Ticket::query();

        if ($from) $base->whereDate('creation_date', '>=', $from);
        if ($to)   $base->whereDate('creation_date', '<=', $to);

        $total    = (clone $base)->count();
        $abiertos = (clone $base)->whereHas('status', fn($q) => $q->where('name', 'Abierto'))->count();
        $proceso  = (clone $base)->whereHas('status', fn($q) => $q->where('name', 'En proceso'))->count();
        $resueltos= (clone $base)->whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto', 'Cerrado']))->count();

        // Vencidos: expiration_date < hoy y estado no cerrado/resuelto
        $vencidos = (clone $base)
            ->whereDate('expiration_date', '<', now())
            ->whereHas('status', fn($q) => $q->whereNotIn('name', ['Resuelto', 'Cerrado']))
            ->count();

        return [
            'total'     => $total,
            'abiertos'  => $abiertos,
            'proceso'   => $proceso,
            'resueltos' => $resueltos,
            'vencidos'  => $vencidos,
        ];
    }

    // ─── Gráfica: tickets por mes ─────────────────────────────────────────────

    /**
     * Agrupa tickets por mes del año actual (o del rango si se filtra).
     * Devuelve array con: mes (label), abiertos, resueltos, date (YYYY-MM).
     */
    public function getTicketsByMonth(?string $from, ?string $to): array
    {
        $year = $from ? substr($from, 0, 4) : now()->year;

        $rows = Ticket::select(
                DB::raw('MONTH(creation_date) as mes_num'),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN statuses.name IN ('Resuelto','Cerrado') THEN 1 ELSE 0 END) as resueltos")
            )
            ->join('statuses', 'tickets.status_id', '=', 'statuses.id')
            ->whereYear('creation_date', $year)
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('tickets.deleted_at')
            ->groupBy('mes_num')
            ->orderBy('mes_num')
            ->get();

        $meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        $result = [];

        foreach ($rows as $r) {
            $idx = $r->mes_num - 1;
            $result[] = [
                'mes'       => $meses[$idx],
                'abiertos'  => (int) $r->total,
                'resueltos' => (int) $r->resueltos,
                'date'      => $year . '-' . str_pad($r->mes_num, 2, '0', STR_PAD_LEFT),
            ];
        }

        return $result;
    }

    // ─── Gráfica: por categoría (departamento) ────────────────────────────────

    /**
     * Cuenta tickets agrupados por departamento.
     * Devuelve los top 4, el resto se agrupa en "Otros".
     */
    public function getByCategory(?string $from, ?string $to): array
    {
        $colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

        $rows = Ticket::select('departments.name', DB::raw('COUNT(*) as total'))
            ->join('departments', 'tickets.department_id', '=', 'departments.id')
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('tickets.deleted_at')
            ->groupBy('departments.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $grandTotal = $rows->sum('total');
        if ($grandTotal === 0) return [];

        return $rows->values()->map(function ($row, $i) use ($grandTotal, $colors) {
            return [
                'name'  => $row->name,
                'value' => $grandTotal > 0 ? round(($row->total / $grandTotal) * 100) : 0,
                'color' => $colors[$i] ?? '#94a3b8',
            ];
        })->toArray();
    }

    // ─── Gráfica: por prioridad ───────────────────────────────────────────────

    /**
     * Cuenta tickets agrupados por prioridad, usando el color definido en BD.
     */
    public function getByPriority(?string $from, ?string $to): array
    {
        return Ticket::select('priorities.name', 'priorities.color', DB::raw('COUNT(*) as total'))
            ->join('priorities', 'tickets.priority_id', '=', 'priorities.id')
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('tickets.deleted_at')
            ->groupBy('priorities.name', 'priorities.color', 'priorities.level')
            ->orderBy('priorities.level')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->name,
                'total' => (int) $r->total,
                'color' => $r->color,
            ])
            ->toArray();
    }

    // ─── Resumen rápido ───────────────────────────────────────────────────────

    /**
     * Promedio de resolución (días) y promedio de rating (calificación).
     */
    public function getResumen(?string $from, ?string $to): array
    {
        // Promedio días resolución: closing_date - creation_date
        $promResolucion = Ticket::whereNotNull('closing_date')
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('deleted_at')
            ->selectRaw('AVG(DATEDIFF(closing_date, creation_date)) as avg_dias')
            ->value('avg_dias');

        // Promedio rating de qualifications
        $promRating = Qualification::when($from, function ($q) use ($from) {
                $q->whereHas('ticket', fn($t) => $t->whereDate('creation_date', '>=', $from));
            })
            ->when($to, function ($q) use ($to) {
                $q->whereHas('ticket', fn($t) => $t->whereDate('creation_date', '<=', $to));
            })
            ->whereNull('deleted_at')
            ->avg('score');

        // Agentes activos = usuarios con tickets asignados y en proceso
        $agentesActivos = Ticket::whereHas('status', fn($q) => $q->where('name', 'En proceso'))
            ->whereNotNull('assigned_user')
            ->whereNull('deleted_at')
            ->distinct('assigned_user')
            ->count('assigned_user');

        // Cumplimiento SLA: tickets cerrados ANTES de expiration_date / total cerrados
        $totalCerrados = Ticket::whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto','Cerrado']))
            ->whereNotNull('closing_date')
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('deleted_at')
            ->count();

        $dentroPlazo = Ticket::whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto','Cerrado']))
            ->whereNotNull('closing_date')
            ->whereColumn('closing_date', '<=', 'expiration_date')
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('deleted_at')
            ->count();

        $cumplimientoSla = $totalCerrados > 0
            ? round(($dentroPlazo / $totalCerrados) * 100)
            : 0;

        return [
            ['n' => round($promResolucion ?? 0, 1) . 'd', 'l' => 'Tiempo prom. resolución'],
            ['n' => round($promRating ?? 0, 1) . '/5', 'l' => 'Calificación promedio'],
            ['n' => (string) $agentesActivos,             'l' => 'Agentes activos'],
            ['n' => $cumplimientoSla . '%',               'l' => 'Cumplimiento SLA'],
        ];
    }

    // ─── Agentes destacados ───────────────────────────────────────────────────

    /**
     * Top 5 agentes con más tickets resueltos/cerrados.
     */
    public function getTopAgentes(?string $from, ?string $to): array
    {
        $rows = Ticket::select('users.name', DB::raw('COUNT(*) as tickets'))
            ->join('users', 'tickets.assigned_user', '=', 'users.id')
            ->whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto', 'Cerrado']))
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('tickets.deleted_at')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('tickets')
            ->limit(5)
            ->get();

        $max = $rows->max('tickets') ?: 1;

        return $rows->map(fn($r) => [
            'name'    => $r->name,
            'tickets' => (int) $r->tickets,
            'pct'     => (int) round(($r->tickets / $max) * 100),
        ])->toArray();
    }

    // ─── Tabla de tickets activos ─────────────────────────────────────────────

    /**
     * Lista paginada de tickets activos con todas las relaciones
     * necesarias para la tabla y el preview lateral.
     */
    public function getActiveTickets(?string $from, ?string $to): array
    {
        return Ticket::with([
                'status',
                'priority',
                'department',
                'helpTopic',
                'slaPlan',
                'requestingUser:id,name',
                'assignedUser:id,name',
                'solutions.user:id,name',
                'histories.user:id,name',
            ])
            ->when($from, fn($q) => $q->whereDate('creation_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('creation_date', '<=', $to))
            ->whereNull('deleted_at')
            ->orderByDesc('creation_date')
            ->limit(18)
            ->get()
            ->map(function (Ticket $t) {
                // Color por prioridad usando el color almacenado en BD
                $priorityColor = $t->priority?->color ?? '#94a3b8';

                // Iniciales para el badge de categoría (2 letras del departamento)
                $deptWords  = explode(' ', $t->department?->name ?? 'XX');
                $catInitial = strtoupper(
                    count($deptWords) >= 2
                        ? $deptWords[0][0] . $deptWords[1][0]
                        : substr($deptWords[0], 0, 2)
                );

                return [
                    // ── campos tabla ──
                    'id'              => '#' . $t->code,
                    'subject'         => $t->subject,
                    'categoryInitial' => $catInitial,
                    'categoryColor'   => $priorityColor,
                    'agents'          => $t->assignedUser
                        ? [['name' => $t->assignedUser->name, 'color' => $priorityColor]]
                        : [],
                    'priority'        => $t->priority?->name,
                    'department_name' => $t->department?->name,    

                    // ── campos preview ──
                    'code'             => $t->code,
                    'status'           => $t->status?->name,
                    'email'            => $t->email,
                    'message'          => $t->message,
                    'creation_date'    => $t->creation_date,
                    'expiration_date'  => $t->expiration_date,
                    'closing_date'     => $t->closing_date,
                    'requesting_user'  => ['name' => $t->requestingUser?->name],
                    'assigned_user'    => ['name' => $t->assignedUser?->name ?? 'Sin asignar'],
                    'department'       => ['name' => $t->department?->name],
                    'help_topic'       => ['name_topic' => $t->helpTopic?->name_topic],
                    'sla_plan'         => $t->slaPlan ? [
                        'name'              => $t->slaPlan->name,
                        'grace_time_hours'  => $t->slaPlan->grace_time_hours ?? null,
                    ] : null,
                    'attach'     => $t->attach ?: null,
                    'solutions'  => $t->solutions->map(fn($s) => [
                        'user'    => ['name' => $s->user?->name],
                        'message' => $s->message,
                        'date'    => $s->created_at?->format('Y-m-d'),
                        'type'    => $s->type ?? 'public_reply',
                    ])->toArray(),
                    'histories' => $t->histories->map(fn($h) => [
                        'user'          => ['name' => $h->user?->name ?? 'Sistema'],
                        'action_type'   => $h->action_type,
                        'internal_note' => $h->internal_note ?? '',
                        'created_at'    => $h->created_at?->format('Y-m-d H:i'),
                    ])->toArray(),
                ];
            })
            ->toArray();
    }

    // ─── helpers privados ─────────────────────────────────────────────────────

    /**
     * Calcula el % de progreso del ticket según su estado.
     * Abierto=10, En proceso=50, Resuelto=90, Cerrado=100
     */
    private function calcProgress(Ticket $ticket): int
    {
        return match($ticket->status?->name) {
            'Abierto'    => 10,
            'En proceso' => 50,
            'Resuelto'   => 90,
            'Cerrado'    => 100,
            default      => 0,
        };
    }
}