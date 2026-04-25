<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketAssignedNotification extends Notification
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
        $url = route('tickets.show', $this->ticket->id);
        return (new MailMessage)
            ->subject('Ticket asignado: ' . $this->ticket->code)
            ->line('Se te ha asignado un nuevo ticket.')
            ->line('Asunto: ' . $this->ticket->subject)
            ->action('Ver ticket', $url)
            ->line('Por favor, atiéndelo a la brevedad.');
    }

    public function toDatabase($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'subject' => $this->ticket->subject,
            'message' => 'Se te ha asignado un ticket.',
            'type' => 'ticket_assigned'
        ];
    }
}
