<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
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
            // Errores para 'name'
            'name.required' => 'El nombre completo es obligatorio.',
            'name.max'      => 'El nombre no puede exceder los 255 caracteres.',

            // Errores para 'email'
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Debes ingresar una dirección de correo válida.',
            'email.unique'   => 'Este correo electrónico ya está registrado en el sistema.',

            // Errores para 'password'
            'password.required' => 'La contraseña es obligatoria para nuevos usuarios.',
            'password.min'      => 'La contraseña debe tener al menos 8 caracteres.',

            // Errores para 'phone_number'
            'phone_number.required' => 'El número de teléfono es obligatorio.',
            'phone_number.digits'   => 'El teléfono debe tener exactamente 8 dígitos.',

            // Errores para 'birthdate'
            'birthdate.required' => 'La fecha de nacimiento es obligatoria.',
            'birthdate.date'     => 'Ingresa una fecha válida.',

            // Errores para 'department_id'
            'department_id.required' => 'Debes seleccionar un departamento.',
            'department_id.exists'   => 'El departamento seleccionado no es válido.',

            // Errores para 'role'
            'role.required' => 'Es necesario asignar un rol al usuario.',
            'role.exists'   => 'El rol seleccionado no es válido.',

            // Errores para 'ext'
            'ext.max' => 'La extensión no puede tener más de 10 caracteres.',
        ];
    }
}
