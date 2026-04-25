<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticket;

    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    // Canales por los que se envía: mail y database
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    // Detalles para el correo electrónico
    public function toMail($notifiable)
    {
        $url = route('tickets.show', $this->ticket->id);

        return (new MailMessage)
            ->subject('Nuevo ticket creado: ' . $this->ticket->code)
            ->greeting('Hola ' . $notifiable->name)
            ->line('Se ha creado un nuevo ticket en el sistema.')
            ->line('Asunto: ' . $this->ticket->subject)
            ->line('Solicitante: ' . ($this->ticket->requestingUser?->name ?? $this->ticket->email))
            ->action('Ver y asignar ticket', $url)
            ->line('Por favor, asigna este ticket al técnico correspondiente.');
    }

    // Datos que se guardan en la tabla notifications (BD)
    public function toDatabase($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'subject' => $this->ticket->subject,
            'message' => 'Nuevo ticket creado. Revisa y asígnalo.',
            'type' => 'new_ticket'
        ];
    }
}
