<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;
class UserStoreRequest extends FormRequest

{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'institution_code' => [
                'nullable',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    $exists = User::withTrashed()->where('institution_code', $value)->first();
                    if ($exists) {
                        if ($exists->trashed()) {
                            $fail('Este código pertenece a un usuario en la papelera. Restáuralo primero.');
                        } else {
                            $fail('Este código institucional ya está asignado a otro usuario.');
                        }
                    }
                }
            ],
            'email' => [
                'required',
                'email',
                function ($attribute, $value, $fail) {
                    $exists = User::withTrashed()->where('email', $value)->first();
                    if ($exists) {
                        if ($exists->trashed()) {
                            $fail('Este correo pertenece a un usuario en la papelera. Restáuralo primero.');
                        } else {
                            $fail('Este correo electrónico ya está registrado en el sistema.');
                        }
                    }
                }
            ],
            'password'      => 'required|min:8',
            'phone_number'  => 'required|digits:8',
            'birthdate'     => 'required|date',
            'department_id' => 'required|exists:departments,id',
            'role'          => 'required|exists:roles,name',
            'ext'           => 'nullable|string|max:10',
        ];
    }

    /**
     * Mensajes de error personalizados en español.
     */
    public function messages(): array
    {
        return [
            // Nombre
            'name.required'         => 'El nombre completo es obligatorio.',
            'name.max'              => 'El nombre no puede exceder los 255 caracteres.',

            // Correo (La validación de "único" y "papelera" está en el Closure de rules)
            'email.required'        => 'El correo electrónico es obligatorio.',
            'email.email'           => 'Debes ingresar una dirección de correo válida.',

            // Código Institucional (La validación de "único" y "papelera" está en el Closure de rules)
            'institution_code.max'  => 'El código institucional no puede tener más de 50 caracteres.',

            // Contraseña
            'password.required'     => 'La contraseña es obligatoria para nuevos usuarios.',
            'password.min'          => 'La contraseña debe tener al menos 8 caracteres.',

            // Teléfono y Extensión
            'phone_number.required' => 'El número de teléfono es obligatorio.',
            'phone_number.digits'   => 'El teléfono debe tener exactamente 8 dígitos.',
            'ext.max'               => 'La extensión no puede tener más de 10 caracteres.',

            // Otros datos
            'birthdate.required'    => 'La fecha de nacimiento es obligatoria.',
            'birthdate.date'        => 'Ingresa una fecha de nacimiento válida.',

            // Relaciones
            'department_id.required'=> 'Debes seleccionar un departamento para el usuario.',
            'department_id.exists'   => 'El departamento seleccionado no es válido.',

            'role.required'         => 'Es necesario asignar un rol al usuario.',
            'role.exists'           => 'El rol seleccionado no es válido en nuestro sistema.',
        ];
    }
}
