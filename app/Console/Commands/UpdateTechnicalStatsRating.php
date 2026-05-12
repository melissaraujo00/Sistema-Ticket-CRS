<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Qualification;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Department;

class UpdateTechnicalStatsRating extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-technical-stats-rating';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando el cálculo de métricas para los registros');

        // 1. Cálculos de métricas globales 
        $ratingAverage = Qualification::avg('score') ?? 0;

        $ticketsResolved = Ticket::whereHas('status', function ($q) {
            $q->whereIn('name', ['Resuelto', 'Cerrado']);
        })->count();

        $averageTime = Ticket::whereNotNull('closing_date')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, creation_date, closing_date)) as avg_time')
            ->first()->avg_time ?? 0;

        $activeTechnicians = User::role('agent')->count();

        // 2. Ranking de Técnicos 
        $techniciRankings = User::role('agent')
            ->select('id', 'name', 'department_id')
            ->addSelect([
                'average_time' => Ticket::selectRaw('AVG(TIMESTAMPDIFF(HOUR, creation_date, closing_date))')
                    ->whereColumn('assigned_user', 'users.id')
                    ->whereNotNull('closing_date')
            ])
            ->withAvg([
                'ticketsAssigned as rating' => function ($query) {
                    $query->join('qualifications', 'tickets.id', '=', 'qualifications.ticket_id');
                }
            ], 'qualifications.score')
            ->withCount([
                'ticketsAssigned as tickets_resolved' => function ($query) {
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['Resuelto', 'Cerrado']));
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

        // 3. Tendencia Mensual
        $monthlyTrend = Qualification::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, AVG(score) as rating')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->map(fn($q) => [
                'month' => Carbon::create($q->year, $q->month)->translatedFormat('M'),
                'month_number' => $q->month,
                'year' => $q->year,
                'rating' => round($q->rating, 2)
            ]);



        $distribution = \App\Models\Qualification::selectRaw('score, count(*) as total')
            ->groupBy('score')
            ->orderByDesc('score')
            ->get();

        // 6. Desempeño por Departamento 
        $departmentPerformance = \App\Models\Department::withCount(['tickets as total_tickets'])
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'total_tickets' => $dept->total_tickets,
                    'average_rating' => \DB::table('qualifications')
                        ->join('tickets', 'qualifications.ticket_id', '=', 'tickets.id')
                        ->where('tickets.department_id', $dept->id)
                        ->avg('score') ?? 0
                ];
            });

        \DB::table('technicalrating_stats')->insert(
            //['id' => 1],
            [
                'rating_average' => round($ratingAverage, 2),
                'tickets_resolved' => $ticketsResolved,
                'average_time' => round($averageTime, 1),
                'active_technicians' => $activeTechnicians,
                'technician_rankings' => json_encode($techniciRankings),
                'monthly_trend' => json_encode($monthlyTrend),
                'rating_distribution' => json_encode($distribution),
                'department_performance' => json_encode($departmentPerformance),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        $this->info('¡Métricas completas pre-calculadas con éxito!');
    }
}
