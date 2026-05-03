<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveAreaRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // 2. Extraemos el ID del área si estamos en la ruta de "Update"
        // Esto evita que la regla 'unique' falle cuando guardas cambios sin alterar el nombre.
        $areaId = $this->route('area') ? $this->route('area')->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:75',
                'unique:areas,name,' . $areaId
            ],
            'description' => [
                'nullable',
                'string'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del área es obligatorio.',
            'name.string'   => 'El formato del nombre no es válido.',
            'name.max'      => 'El nombre no puede superar los 75 caracteres.',
            'name.unique'   => 'Ya existe un área con este nombre registrada en el sistema.',
        ];
    }
}
