<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Qualification;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TechnicalRatingsController extends Controller
{
    public function index()
    {
        // 1. Rating Promedio
        $ratingAverage = Qualification::avg('score') ?? 0;

        // 1.2 Tickets Resueltos
        $ticketsResolved = Ticket::whereHas('status', function ($q) {
            
            // resisa si la tabla de estatus tiene los mismos valores que la base de datos
            $q->whereIn('name', ['Resuelto', 'Cerrado']);
        })->count();

        // 1.3 Tiempo Promedio
        $averageTime = Ticket::whereNotNull('closing_date')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, creation_date, closing_date)) as avg_time')
            ->first()->avg_time ?? 0;

        // 1.4 Técnicos Activos
        $activeTechnicians = User::role('agent')->count();

        // 2. Ranking de Técnicos por Rating
        $techniciRankings = User::role('agent')
            ->select('id', 'name')
            ->withAvg([
                'ticketsAssigned as rating' => function ($query) {
                    $query->join('qualifications', 'tickets.id', '=', 'qualifications.ticket_id');
                }
            ], 'qualifications.score')
            ->orderByDesc('rating')
            ->take(6)
            ->get()
            ->map(fn($t) => [
                'name' => $t->name,
                'rating' => $t->rating
            ]);

        $techniciRankingsImproved = User::role('agent')
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

        // rankin de mes    

        $monthlyTrend = Qualification::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, AVG(score) as rating')
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get()
            ->map(fn($q) => [
                'month' => Carbon::create($q->year, $q->month)->translatedFormat('M'),
                'rating' => round($q->rating, 2)
            ]);

        // 3. Distribución de Calificaciones 
        $distribution = Qualification::selectRaw('score, count(*) as total')
            ->groupBy('score')
            ->orderByDesc('score')
            ->get();

        // 4. Desempeño por Departamento
        $departmentPerformance = Department::withCount(['tickets as total_tickets'])
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'total_tickets' => $dept->total_tickets,
                    'average_rating' => DB::table('qualifications')
                        ->join('tickets', 'qualifications.ticket_id', '=', 'tickets.id')
                        ->where('tickets.department_id', $dept->id)
                        ->avg('score') ?? 0
                ];
            });

        // Retornar temporalmente como JSON para pruebas
        return response()->json([
            'stats' => [
                'ratingAverage' => round($ratingAverage, 2),
                'ticketsResolved' => $ticketsResolved,
                'averageTime' => round($averageTime, 1),
                'activeTechnicians' => $activeTechnicians,

            ],
            'techniciRankings' => $techniciRankings,
            'monthlyTrend' => $monthlyTrend,
            'distribution' => $distribution,
            'departmentPerformance' => $departmentPerformance,
            'techniciRankingsImproved' => $techniciRankingsImproved
        ]);
    }
}
