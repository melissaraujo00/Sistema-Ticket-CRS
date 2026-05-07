<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Area; // <-- Asegúrate de importar el modelo

class SaveAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $areaId = $this->route('area') ? $this->route('area')->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:75',
                // Validación personalizada
                function ($attribute, $value, $fail) use ($areaId) {
                    $area = Area::withTrashed()
                        ->where('name', $value)
                        ->where('id', '!=', $areaId)
                        ->first();

                    if ($area) {
                        // Si existe, verificamos en qué estado está
                        if ($area->trashed()) {
                            $fail('Esta área fue eliminada. Ve a la Papelera para restaurarla.');
                        } else {
                            $fail('Ya existe un área activa con este nombre en la lista.');
                        }
                    }
                },
                'regex:/^(?=.*[\pL])[\pL\s0-9\-]+$/u'
            ],
            'description' => [
                'nullable',
                'string'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del área es obligatorio.',
            'name.string'   => 'El formato del nombre no es válido.',
            'name.max'      => 'El nombre no puede superar los 75 caracteres.',
            'name.regex'    => 'El nombre debe contener al menos una letra y no permite símbolos especiales.',
        ];
    }
}
