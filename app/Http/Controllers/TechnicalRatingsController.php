<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class TechnicalRatingsController extends Controller
{
    public function index(Request $request)
    {
        // 1. Obtener periodo solicitado o actual
        $targetYear = (int) $request->input('year', now()->year);
        $targetMonth = (int) $request->input('month', now()->month);

        // 2. Consultar la estadística para ese periodo específico
        $stats = DB::table('technicalrating_stats')
            ->where('month', $targetMonth)
            ->where('year', $targetYear)
            ->first();

        // 3. Obtener tendencia (6 meses previos o hasta el mes seleccionado)
        $targetDate = Carbon::create($targetYear, $targetMonth, 1);
        
        $monthlyTrend = DB::table('technicalrating_stats')
            ->select('month', 'year', 'rating_average as rating')
            ->where(function($query) use ($targetYear, $targetMonth) {
                $query->where('year', '<', $targetYear)
                      ->orWhere(function($q) use ($targetYear, $targetMonth) {
                          $q->where('year', $targetYear)
                            ->where('month', '<=', $targetMonth);
                      });
            })
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(6)
            ->get()
            ->map(fn($item) => [
                'month' => Carbon::create($item->year, $item->month, 1)->translatedFormat('M'),
                'month_number' => $item->month,
                'year' => $item->year,
                'rating' => (float) $item->rating
            ])
            ->reverse()
            ->values();

        if (!$stats) {
            return Inertia::render('rating-dashboard/index', [
                'stats' => [
                    'ratingAverage' => 0,
                    'ticketsResolved' => 0,
                    'averageTime' => 0,
                    'activeTechnicians' => \App\Models\User::role('agent')->count(),
                ],
                'technicianRankings' => [],
                'monthlyTrend' => $monthlyTrend,
                'distribution' => [],
                'departmentPerformance' => [],
                'currentPeriod' => [
                    'month' => $targetMonth,
                    'year' => $targetYear
                ],
                'warning' => 'No hay datos para el periodo seleccionado'
            ]);
        }

        return Inertia::render('rating-dashboard/index', [
            'stats' => [
                'ratingAverage' => (float) $stats->rating_average,
                'ticketsResolved' => (int) $stats->tickets_resolved,
                'averageTime' => (float) $stats->average_time,
                'activeTechnicians' => (int) $stats->active_technicians,
            ],
            'technicianRankings' => json_decode($stats->technician_rankings),
            'monthlyTrend' => $monthlyTrend,
            'distribution' => json_decode($stats->rating_distribution),
            'departmentPerformance' => json_decode($stats->department_performance),
            'updated_at' => $stats->updated_at,
            'currentPeriod' => [
                'month' => $targetMonth,
                'year' => $targetYear
            ]
        ]);
    }
}
