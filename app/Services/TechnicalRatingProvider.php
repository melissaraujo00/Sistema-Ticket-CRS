<?php

namespace App\Services;

use App\Models\Qualification;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TechnicalRatingProvider
{
    /**
     * Calcula y actualiza las estadísticas para un mes y año específicos.
     * 
     * @param int $month
     * @param int $year
     * @return void
     */
    public function updateMonthlyStats(int $month, int $year): void
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // 1. Cálculos de métricas del periodo
        $ratingAverage = Qualification::whereBetween('created_at', [$startDate, $endDate])
            ->avg('score') ?? 0;

        $ticketsResolved = Ticket::whereHas('status', function ($q) {
            $q->whereIn('name', ['Resuelto', 'Cerrado']);
        })
        ->whereBetween('closing_date', [$startDate, $endDate])
        ->count();

        $averageTime = Ticket::whereNotNull('closing_date')
            ->whereBetween('closing_date', [$startDate, $endDate])
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, creation_date, closing_date)) as avg_time')
            ->first()->avg_time ?? 0;

        $activeTechnicians = User::role('agent')->count(); // Los técnicos activos suelen ser globales o por departamento, mantenemos coherencia

        // 2. Ranking de Técnicos (Filtrado por periodo)
        $technicianRankings = User::role('agent')
            ->select('id', 'name', 'department_id')
            ->addSelect([
                'average_time' => Ticket::selectRaw('AVG(TIMESTAMPDIFF(HOUR, creation_date, closing_date))')
                    ->whereColumn('assigned_user', 'users.id')
                    ->whereNotNull('closing_date')
                    ->whereBetween('closing_date', [$startDate, $endDate])
            ])
            ->withAvg([
                'ticketsAssigned as rating' => function ($query) use ($startDate, $endDate) {
                    $query->join('qualifications', 'tickets.id', '=', 'qualifications.ticket_id')
                          ->whereBetween('qualifications.created_at', [$startDate, $endDate]);
                }
            ], 'qualifications.score')
            ->withCount([
                'ticketsAssigned as tickets_resolved' => function ($query) use ($startDate, $endDate) {
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto', 'Cerrado']))
                          ->whereBetween('closing_date', [$startDate, $endDate]);
                }
            ])
            ->with('department:id,name')
            ->orderByDesc('rating')
            ->take(6)
            ->get()
            ->map(fn($t) => [
                'name' => $t->name,
                'department' => $t->department->name ?? 'Sin departamento',
                'rating' => round($t->rating ?? 0, 1),
                'tickets_resolved' => $t->tickets_resolved,
                'average_time' => round($t->average_time ?? 0, 1),
                'status' => match (true) {
                    $t->rating >= 4.8 => 'Excelente',
                    $t->rating >= 4.5 => 'Muy Bueno',
                    $t->rating >= 4.0 => 'Bueno',
                    default => 'Regular'
                }
            ]);

        // 3. Distribución de calificaciones del periodo
        $distribution = Qualification::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('score, count(*) as total')
            ->groupBy('score')
            ->orderByDesc('score')
            ->get();

        // 4. Desempeño por Departamento del periodo
        $departmentPerformance = Department::withCount([
                'tickets as total_tickets' => function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                }
            ])
            ->get()
            ->map(function ($dept) use ($startDate, $endDate) {
                return [
                    'name' => $dept->name,
                    'total_tickets' => $dept->total_tickets,
                    'average_rating' => DB::table('qualifications')
                        ->join('tickets', 'qualifications.ticket_id', '=', 'tickets.id')
                        ->where('tickets.department_id', $dept->id)
                        ->whereBetween('qualifications.created_at', [$startDate, $endDate])
                        ->avg('score') ?? 0
                ];
            });

        // 5. Actualizar o Insertar el registro para este mes/año
        DB::table('technicalrating_stats')->updateOrInsert(
            ['month' => $month, 'year' => $year],
            [
                'rating_average' => round($ratingAverage, 2),
                'tickets_resolved' => $ticketsResolved,
                'average_time' => round($averageTime, 1),
                'active_technicians' => $activeTechnicians,
                'technician_rankings' => json_encode($technicianRankings),
                'rating_distribution' => json_encode($distribution),
                'department_performance' => json_encode($departmentPerformance),
                'updated_at' => now()
            ]
        );
    }
}
