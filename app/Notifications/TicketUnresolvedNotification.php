<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class TicketUnresolvedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticket;
    protected $justification;
    protected $agent;
    protected $advances;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket, string $justification, $agent = null, string $advances = '')
    {
        $this->ticket = $ticket;
        $this->justification = $justification;
        $this->agent = $agent ?? auth()->user();
        $this->advances = $advances;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $url = route('tickets.show', $this->ticket->id);
        $agentName = $this->agent->name ?? 'Un técnico asignado';

        return (new MailMessage)
            ->subject('⚠️ Reporte de Incidencia: Ticket #' . $this->ticket->code)
            ->greeting('Estimado/a ' . $notifiable->name . ',')
            ->line('Le informamos que el técnico asignado ha emitido un reporte de incidencia sobre su solicitud, indicando que no ha sido posible resolverla en este momento.')
            ->line(new HtmlString('<strong>Resumen de la Solicitud:</strong>'))
            ->line('• Ticket: #' . $this->ticket->code)
            ->line('• Asunto: ' . $this->ticket->subject)
            ->line('• Técnico: ' . $agentName)
            
            ->line(new HtmlString('<div style="margin-top: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">' .
                '<div style="background-color: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Avances Realizados</div>' .
                '<div style="padding: 15px; font-style: italic;">' . nl2br(e($this->advances)) . '</div>' .
                '</div>'))

            ->line(new HtmlString('<div style="margin-top: 15px; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">' .
                '<div style="background-color: #fef2f2; padding: 10px 15px; border-bottom: 1px solid #fee2e2; font-weight: bold; color: #991b1b;">Justificación Técnica</div>' .
                '<div style="padding: 15px; font-style: italic;">' . nl2br(e($this->justification)) . '</div>' .
                '</div>'))

            ->line('El sistema ha guardado las evidencias adjuntas por el técnico para su revisión por parte del equipo de supervisión.')
            ->action('Ver Detalles y Evidencias', $url)
            ->line('Nuestro equipo se pondrá en contacto con usted si se requiere información adicional o para informarle sobre la reasignación del caso.')
            ->salutation('Atentamente, el equipo de Soporte Técnico.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toDatabase($notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'subject' => $this->ticket->subject,
            'message' => 'Reporte de incidencia enviado por ' . ($this->agent->name ?? 'técnico') . '.',
            'type' => 'ticket_unresolved',
            'agent_id' => $this->agent->id ?? null
        ];
    }
}
