<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use App\Models\User;
use App\Notifications\NewTicketNotification;
use Illuminate\Support\Facades\Notification;

// ... otros "use"

class SendNewTicketNotification
{
    /**
     * Handle the event.
     */
    public function handle(TicketCreated $event): void
    {
        // Aquí va la lógica de notificación que ya definiste
        $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })
            ->where('department_id', $event->ticket->department_id)
            ->get();

        Notification::send($admins, new NewTicketNotification($event->ticket));
    }
}
