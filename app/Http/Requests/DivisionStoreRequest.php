<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DivisionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'characteristics' => ['nullable', 'string', 'max:1000'],
            'department_id' => ['required', 'exists:departments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la división es obligatorio.',
            'department_id.required' => 'Debe seleccionar un departamento al que pertenece.',
            'department_id.exists' => 'El departamento seleccionado no es válido.',
        ];
    }
}
