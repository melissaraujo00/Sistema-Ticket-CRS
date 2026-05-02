<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePriorityRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'name'  => 'required|string|max:50',
            'color' => ['required', 'string', 'regex:/^#([a-fA-F0-9]{3}){1,2}$/'],
            'level' => [
                'required',
                'integer',
                Rule::unique('priorities', 'level')->ignore($this->route('priority'))
            ]
        ];

    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required'  => 'El nombre de la prioridad es obligatorio.',
            'name.string'    => 'El nombre debe ser una cadena de texto.',
            'name.max'       => 'El nombre no puede tener más de 50 caracteres.',

            'color.required' => 'Debes seleccionar un color.',
            'color.regex'    => 'El formato del color debe ser un hexadecimal válido (ej: #FF0000 o #F00).',

            'level.required' => 'El nivel de prioridad es obligatorio.',
            'level.integer'  => 'El nivel debe ser un número entero.',
            'level.unique'   => 'Este nivel de prioridad ya existe, por favor elige otro.',
        ];
    }
}