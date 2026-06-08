<?php

namespace App\Http\Requests;

use App\Models\Division;
use Illuminate\Foundation\Http\FormRequest;

class SaveDivisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el ID de la división actual si es una actualización
        $divisionId = $this->route('division') ? $this->route('division')->id : null;

        // Capturamos el departamento que el usuario está intentando asignar
        $departmentId = $this->input('department_id');

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($divisionId, $departmentId) {
                    // Si no hay department_id, la regla de abajo ('exists') lo atrapará, así que aquí no hacemos nada
                    if (!$departmentId) return;

                    $exists = Division::withTrashed()
                        ->where('name', $value)
                        ->where('department_id', $departmentId)
                        ->where('id', '!=', $divisionId)
                        ->first();

                    if ($exists) {
                        $exists->trashed()
                            ? $fail('Esta división está en la papelera de este departamento. Ve a la Papelera para restaurarla.')
                            : $fail('Ya existe una división activa con este nombre en el departamento seleccionado.');
                    }
                }
            ],
            'characteristics' => ['nullable', 'string', 'max:70'],
            'department_id' => ['required', 'exists:departments,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la división es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 50 caracteres.',
            'characteristics.max' => 'Las características no pueden superar los 70 caracteres.',
            'department_id.required' => 'Debe seleccionar un departamento al que pertenece.',
            'department_id.exists' => 'El departamento seleccionado no es válido.',
        ];
    }
}
