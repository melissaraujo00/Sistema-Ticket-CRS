<?php

namespace App\Observers;

use App\Models\Qualification;
use App\Services\TechnicalRatingProvider;
use Carbon\Carbon;

class QualificationObserver
{
    protected $provider;

    public function __construct(TechnicalRatingProvider $provider)
    {
        $this->provider = $provider;
    }

    /**
     * Handle the Qualification "saved" event.
     */
    public function saved(Qualification $qualification): void
    {
        $this->updateStats($qualification);
    }

    /**
     * Handle the Qualification "deleted" event.
     */
    public function deleted(Qualification $qualification): void
    {
        $this->updateStats($qualification);
    }

    /**
     * Disparar la actualización del periodo correspondiente.
     */
    protected function updateStats(Qualification $qualification): void
    {
        // Usamos el created_at de la calificación para determinar el periodo
        $date = $qualification->created_at ?? now();
        
        $this->provider->updateMonthlyStats(
            $date->month,
            $date->year
        );
    }
}
