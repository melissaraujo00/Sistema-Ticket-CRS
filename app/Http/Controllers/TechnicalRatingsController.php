<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Qualification;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class TechnicalRatingsController extends Controller
{
    public function index(Request $request)
    {
        $stats = DB::table('technicalrating_stats')->orderByDesc('id')->first();

    if (!$stats) {
        return Inertia::render('rating-dashboard/index', [
            'error' => 'Estadísticas no generadas aún'
        ]);
    }

    $monthlyTrend = collect(json_decode($stats->monthly_trend, true));

    $targetYear = $request->input('year', now()->year);
    $targetMonth = $request->input('month', now()->month);

    $monthsCount = max(1, (int) $request->input('months_count', 7));

    //Calculamos la ventana de tiempo dinámicamente
    $endDate = Carbon::create($targetYear, $targetMonth, 1)->endOfMonth();

    // Si quiere 1 mes, restamos 0. Si quiere 7 meses, restamos 6.
    $monthsToSubtract = $monthsCount - 1;
    $startDate = Carbon::create($targetYear, $targetMonth, 1)->subMonths($monthsToSubtract)->startOfMonth();

    // 5. Filtramos el historial
    $filteredTrend = $monthlyTrend->filter(function ($item) use ($startDate, $endDate) {
        if (!isset($item['year']) || !isset($item['month_number'])) return true;
        $itemDate = Carbon::create($item['year'], $item['month_number'], 1);
        return $itemDate->between($startDate, $endDate);
    })
    ->sortBy(function ($item) {
        if (!isset($item['year']) || !isset($item['month_number'])) return 0;
        return Carbon::create($item['year'], $item['month_number'], 1)->timestamp;
    })
    ->values()
    ->all();

    return Inertia::render('rating-dashboard/index', [
        'stats' => [
            'ratingAverage' => (float) $stats->rating_average,
            'ticketsResolved' => (int) $stats->tickets_resolved,
            'averageTime' => (float) $stats->average_time,
            'activeTechnicians' => (int) $stats->active_technicians,
        ],
        'technicianRankings' => json_decode($stats->technician_rankings),
        'monthlyTrend' => $filteredTrend,
        'distribution' => json_decode($stats->rating_distribution),
        'departmentPerformance' => json_decode($stats->department_performance),
        'updated_at' => $stats->updated_at
    ]);
    }

}
