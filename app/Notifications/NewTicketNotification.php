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

    // Define los canales de envío (base de datos y correo)
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    // Configura el correo electrónico
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nuevo Ticket Creado')
            ->line('Se ha creado un nuevo ticket en su departamento.')
            ->line('Asunto: ' . $this->ticket->subject)
            ->action('Ver Ticket', url('/tickets/' . $this->ticket->id))
            ->line('Gracias por usar nuestro sistema!');
    }

    // Define los datos que se guardarán en la base de datos
    public function toDatabase($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'subject' => $this->ticket->subject,
            'message' => 'Un nuevo ticket ha sido creado en su departamento.',
        ];
    }
}
