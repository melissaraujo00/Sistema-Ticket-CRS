<?php

namespace App\Http\Requests;

use App\Models\Department;
use Illuminate\Foundation\Http\FormRequest;

class SaveDepartmentRequest extends FormRequest
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
        // Obtenemos el ID del departamento si estamos en la ruta de "actualizar"
        $departmentId = $this->route('department') ? $this->route('department')->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:75',
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
                'regex:/^(?=.*[\pL])[\pL\s0-9\-]+$/u' // Permite letras, números, espacios y guiones
            ],
            'description'      => ['required', 'string'],
            'email_department' => ['required', 'email', 'max:100'],
            'area_id'          => ['required', 'exists:areas,id'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name.regex'       => 'El nombre del departamento solo puede contener letras, números, espacios y guiones.',
            'area_id.required' => 'Debes seleccionar un área a la que pertenezca este departamento.',
            'area_id.exists'   => 'El área seleccionada no es válida en nuestro sistema.',
        ];
    }
}
