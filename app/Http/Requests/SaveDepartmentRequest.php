<?php

namespace App\Http\Requests;

use App\Models\Department;
use Illuminate\Foundation\Http\FormRequest;

class SaveDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el ID del departamento actual si es una actualización
        $departmentId = $this->route('department') ? $this->route('department')->id : null;

        return [
            'name' => ['required', 'string', 'max:75',
                function ($attribute, $value, $fail) use ($departmentId) {
                    $exists = Department::withTrashed()
                        ->where('name', $value)
                        ->where('id', '!=', $departmentId)
                        ->first();

                    if ($exists) {
                        $exists->trashed()
                            ? $fail('Este departamento está en la papelera. Ve a la Papelera para restaurarlo.')
                            : $fail('Ya existe un departamento activo con este nombre.');
                    }
                },
                'regex:/^(?=.*[\pL])[\pL\s0-9\-]+$/u'
            ],
            'email_department' => ['required', 'email', 'max:100',
                // Validación de unicidad incluyendo registros eliminados
                function ($attribute, $value, $fail) use ($departmentId) {
                    $exists = Department::withTrashed()
                        ->where('email_department', $value)
                        ->where('id', '!=', $departmentId)
                        ->first();

                    if ($exists) {
                        if ($exists->trashed()) {
                            $fail('Este correo pertenece a un departamento en la papelera.');
                        } else {
                            $fail('Este correo electrónico ya está registrado en otro departamento activo.');
                        }
                    }
                }
            ],
            'description'      => ['nullable', 'string'],
            'area_id'     => ['required', 'exists:areas,id'],
            'head_ids'         => ['nullable', 'array'],
            'head_ids.*'       => ['exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            // Mensajes para el Nombre
            'name.required'             => 'El nombre del departamento es obligatorio.',
            'name.string'               => 'El nombre debe ser una cadena de texto válida.',
            'name.max'                  => 'El nombre no puede superar los 75 caracteres.',
            'name.regex'                => 'El nombre solo puede contener letras, números, espacios y guiones.',

            // Mensajes para el Correo
            'email_department.required' => 'El correo electrónico del departamento es obligatorio.',
            'email_department.email'    => 'Debes ingresar una dirección de correo válida.',
            'email_department.max'      => 'El correo no puede exceder los 100 caracteres.',

            // Mensajes para el Área
            'area_id.required'          => 'Debes seleccionar un área a la que pertenezca este departamento.',
            'area_id.exists'            => 'El área seleccionada no es válida.',

            // Mensajes para Jefaturas
            'head_ids.array'            => 'El formato de los jefes asignados no es válido.',
            'head_ids.*.exists'         => 'Uno o más usuarios seleccionados como jefes no existen.',
        ];
    }
}
