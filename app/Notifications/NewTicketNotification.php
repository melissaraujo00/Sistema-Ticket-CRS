<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTicketNotification extends Notification
{
    use Queueable;

    protected $ticket;

    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $url = route('tickets.unassigned'); 

        return (new MailMessage)
            ->subject('Nuevo ticket pendiente: ' . $this->ticket->code)
            ->line('Se ha creado un nuevo ticket en tu departamento.')
            ->line('Asunto: ' . $this->ticket->subject)
            ->line('Solicitante: ' . $this->ticket->requestingUser->name)
            ->action('Ver y asignar ticket', $url)
            ->line('Por favor, asigna un técnico para su atención.');
    }

    public function toDatabase($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'subject' => $this->ticket->subject,
            'message' => 'Nuevo ticket pendiente de asignación.',
            'type' => 'new_ticket',
            'url' => route('tickets.unassigned'),
        ];
    }
}
