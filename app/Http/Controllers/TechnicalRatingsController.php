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
        $stats = DB::table('technicalrating_stats')->find(1);

    if (!$stats) {
        return response()->json(['error' => 'Estadísticas no generadas aún'], 404);
    }

    return response()->json([
        'stats' => [
            'ratingAverage' => $stats->rating_average,
            'ticketsResolved' => $stats->tickets_resolved,
            'averageTime' => $stats->average_time,
            'activeTechnicians' => $stats->active_technicians,
        ],
        'techniciRankings' => json_decode($stats->technician_rankings),
        'monthlyTrend' => json_decode($stats->monthly_trend),
        'distribution' => json_decode($stats->rating_distribution),
        'departmentPerformance' => json_decode($stats->department_performance),
        'updated_at' => $stats->updated_at
    ]);
    }
    
}
