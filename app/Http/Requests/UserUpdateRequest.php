<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\User;

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
            'name' => 'required|string|max:255',
            'institution_code' => [
                'nullable',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($userId) {
                    $exists = User::withTrashed()
                        ->where('institution_code', $value)
                        ->where('id', '!=', $userId)
                        ->first();
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
                function ($attribute, $value, $fail) use ($userId) {
                    $exists = User::withTrashed()
                        ->where('email', $value)
                        ->where('id', '!=', $userId)
                        ->first();
                    if ($exists) {
                        if ($exists->trashed()) {
                            $fail('Este correo pertenece a un usuario en la papelera. Restáuralo primero.');
                        } else {
                            $fail('Este correo electrónico ya está siendo utilizado por otro usuario.');
                        }
                    }
                }
            ],
            'phone_number'  => 'required|digits:8',
            'birthdate'     => 'required|date',
            'department_id' => 'required|exists:departments,id',
            'role'          => 'required|exists:roles,name',
            'password'      => 'nullable|min:8',
            'ext'           => 'nullable|string|max:10',
            'is_head'       => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'El nombre completo es obligatorio.',
            'name.max'              => 'El nombre no puede exceder los 255 caracteres.',

            'email.required'        => 'El correo electrónico no puede quedar vacío.',
            'email.email'           => 'Debes ingresar una dirección de correo válida.',

            'institution_code.max'  => 'El código institucional no puede exceder los 50 caracteres.',

            'password.min'          => 'Si deseas cambiar la contraseña, debe tener al menos 8 caracteres.',

            'phone_number.required' => 'El número de teléfono es obligatorio.',
            'phone_number.digits'   => 'El teléfono debe tener exactamente 8 dígitos.',
            'ext.max'               => 'La extensión no puede tener más de 10 caracteres.',

            'birthdate.required'    => 'La fecha de nacimiento es obligatoria.',
            'birthdate.date'        => 'Formato de fecha de nacimiento no válido.',

            'department_id.required'=> 'Debes asignar un departamento al usuario.',
            'department_id.exists'  => 'El departamento seleccionado no existe.',

            'role.required'         => 'El usuario debe tener un rol asignado.',
            'role.exists'           => 'El rol seleccionado no es válido.',

            'is_head.boolean'       => 'El formato del identificador de jefatura es inválido.',
        ];
    }
}
