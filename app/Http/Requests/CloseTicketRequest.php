<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ticket = $this->route('ticket');
        $user = $this->user();

        // Dueño del ticket
        $isOwner = (int) $ticket->requesting_user === (int) $user->id;

        // Admin o superadmin también pueden cerrar
        $isAdmin = $user->hasRole(['admin', 'superadmin']);

        // Jefe del departamento del ticket
        $isDeptHead = $user->can('assign_tickets') && $user->department_id === $ticket->department_id;

        return $isOwner || $isAdmin || $isDeptHead;
    }

    public function rules(): array
    {
        return [
            'rating'  => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ];
    }
}
