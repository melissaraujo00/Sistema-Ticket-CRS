<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketIncidentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // La autorización ya se maneja en el controlador por ahora
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'avances' => 'required|string|min:10',
            'justificacion' => 'required|string|min:10',
            'adjuntos.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,mp4,mov,txt,log',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'avances.required' => 'Es obligatorio detallar los avances realizados.',
            'avances.min' => 'La descripción de los avances debe tener al menos 10 caracteres.',
            'justificacion.required' => 'Debe proporcionar una justificación técnica.',
            'justificacion.min' => 'La justificación debe ser más descriptiva (mínimo 10 caracteres).',
            'adjuntos.*.max' => 'Cada archivo de evidencia no debe superar los 10MB.',
            'adjuntos.*.mimes' => 'Solo se permiten archivos de imagen, PDF, video o texto/log.',
        ];
    }
}
