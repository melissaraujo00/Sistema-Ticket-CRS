<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name'          => 'required|string|max:255',
            'email'         => ['required', 'email', Rule::unique('users')->ignore($userId)],
            'phone_number'  => 'required|digits:8',
            'birthdate'     => 'required|date',
            'department_id' => 'required|exists:departments,id',
            'role'          => 'required|exists:roles,name',
            'password'      => 'nullable|min:8', // Opcional en edición
            'ext'           => 'nullable|string|max:10',
        ];
    }

    /**
     * Mensajes de error personalizados en español.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre completo es obligatorio.',
            'name.max'      => 'El nombre no puede exceder los 255 caracteres.',

            'email.required' => 'El correo electrónico no puede quedar vacío.',
            'email.email'    => 'Debes ingresar una dirección de correo válida.',
            'email.unique'   => 'Este correo electrónico ya está siendo utilizado por otro usuario.',

            'phone_number.required' => 'El número de teléfono es obligatorio.',
            'phone_number.digits'   => 'El teléfono debe tener exactamente 8 dígitos.',

            'birthdate.required' => 'La fecha de nacimiento es obligatoria.',
            'birthdate.date'     => 'Formato de fecha no válido.',

            'department_id.required' => 'Debes asignar un departamento.',
            'department_id.exists'   => 'El departamento seleccionado no existe en nuestros registros.',

            'role.required' => 'El usuario debe tener un rol asignado.',
            'role.exists'   => 'El rol seleccionado no es válido.',

            'password.min' => 'Si deseas cambiar la contraseña, debe tener al menos 8 caracteres.',

            'ext.max' => 'La extensión no puede exceder los 10 caracteres.',
        ];
    }
}
