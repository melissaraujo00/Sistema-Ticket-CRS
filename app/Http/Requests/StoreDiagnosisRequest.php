<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiagnosisRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // La autorización de rol técnico se verifica en el middleware/controlador
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo_diagnostico' => 'required|string|max:150',
            'observacion'      => 'required|string|min:10',
            'adjuntos'         => 'nullable|array',
            'adjuntos.*'       => 'file|max:10240', // Max 10MB por archivo
            'adjuntos_'        => 'nullable|array',
            'adjuntos_.*'      => 'file|max:10240',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'tipo_diagnostico.required' => 'El tipo de diagnóstico es obligatorio.',
            'tipo_diagnostico.string'   => 'El tipo de diagnóstico debe ser una cadena de texto.',
            'tipo_diagnostico.max'      => 'El tipo de diagnóstico no puede exceder los 150 caracteres.',
            'observacion.required'      => 'La observación o detalle del diagnóstico es obligatoria.',
            'observacion.string'        => 'La observación debe ser una cadena de texto.',
            'observacion.min'           => 'La observación del diagnóstico debe tener al menos 10 caracteres.',
            'adjuntos.array'            => 'Los archivos adjuntos deben enviarse en formato de lista.',
            'adjuntos.*.file'           => 'Cada archivo adjunto debe ser un archivo válido.',
            'adjuntos.*.max'            => 'Los archivos adjuntos no pueden pesar más de 10 megabytes.',
            'adjuntos_.array'           => 'Los archivos adjuntos adicionales deben enviarse en formato de lista.',
            'adjuntos_.*.file'          => 'Cada archivo adjunto adicional debe ser un archivo válido.',
            'adjuntos_.*.max'           => 'Los archivos adjuntos adicionales no pueden pesar más de 10 megabytes.',
        ];
    }
}
