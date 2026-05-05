<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreInternalNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ticket = $this->route('ticket');
        $user = $this->user();

        // Pasa si es Jefe (assign_tickets) O si es el técnico actualmente asignado al ticket
        return $user->can('assign_tickets') || $user->id === $ticket->assigned_user;
    }
    public function rules(): array
    {
        return [
            'internal_note' => 'required|string|max:2000',
        ];
    }
}
