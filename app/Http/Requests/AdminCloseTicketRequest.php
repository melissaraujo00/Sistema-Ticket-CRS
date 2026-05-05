<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class AdminCloseTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo quien puede asignar tickets puede hacer cierres administrativos
        return $this->user()->can('assign_tickets');
    }

    public function rules(): array
    {
        return [
            'internal_note' => 'required|string|max:1000',
        ];
    }
}
