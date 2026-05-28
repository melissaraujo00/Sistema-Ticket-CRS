<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TechnicalRatingProvider;
use App\Models\Qualification;
use Carbon\Carbon;

class UpdateTechnicalStatsRating extends Command
{
    /**
     * El nombre y firma del comando.
     * Agregamos la opción --all para regenerar todo el histórico.
     */
    protected $signature = 'app:update-technical-stats-rating {--all : Regenerar estadísticas de todos los meses con datos}';

    /**
     * Descripción del comando.
     */
    protected $description = 'Calcula y actualiza las estadísticas de rendimiento de técnicos por mes.';

    /**
     * Ejecutar el comando.
     */
    public function handle(TechnicalRatingProvider $provider)
    {
        if ($this->option('all')) {
            $this->info('Regenerando histórico completo...');
            
            // Buscar todos los periodos únicos en las calificaciones
            $periods = Qualification::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year')
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get();

            foreach ($periods as $p) {
                $this->info("Procesando periodo: {$p->month}/{$p->year}");
                $provider->updateMonthlyStats($p->month, $p->year);
            }
        } else {
            $this->info('Actualizando periodo actual...');
            $provider->updateMonthlyStats(now()->month, now()->year);
        }

        $this->info('¡Proceso completado con éxito!');
    }
}
