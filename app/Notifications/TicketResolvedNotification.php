<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketResolvedNotification extends Notification
{
    use Queueable;

    protected $ticket;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        // Por ahora solo base de datos (campanita web)
        return ['database'];
    }

    /**
     * Get the array representation of the notification for database storage.
     *
     * @return array<string, mixed>
     */
    public function toDatabase($notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'subject' => $this->ticket->subject,
            'message' => "Tu ticket #{$this->ticket->code} ha sido resuelto. Por favor, revísalo para la calificación de la solución.",
            'type' => 'ticket_resolved',
            'url' => route('tickets.show', $this->ticket->id) . '?rating=true',
        ];
    }
}
