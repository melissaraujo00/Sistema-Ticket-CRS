<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSlaPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Corregido: apuntando a la tabla 'sla_plans'
            'name'             => 'required|string|max:50|unique:sla_plans,name', 
            'grace_time_hours' => 'required|integer|gt:0',
            'working_hours'    => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string'   => 'El nombre debe ser una cadena de texto.',
            'name.max'      => 'El nombre no debe exceder los 50 caracteres.',
            'name.unique'   => 'Este nombre de SLA ya está en uso. Por favor, elige otro.', 
            
            'grace_time_hours.required' => 'Las horas de gracia son obligatorias.',
            'grace_time_hours.integer'  => 'Las horas de gracia deben ser un número entero.',
            'grace_time_hours.gt'       => 'Las horas de gracia deben ser un número positivo mayor a 0.',

            'working_hours.required' => 'El campo de horas laborables es obligatorio.',
            'working_hours.boolean'  => 'El campo de horas laborables debe ser verdadero o falso.',
        ];
    }
}
