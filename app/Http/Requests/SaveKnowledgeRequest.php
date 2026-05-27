<?php

namespace App\Http\Requests;

use App\Models\knowledge;
use Illuminate\Foundation\Http\FormRequest;

class SaveKnowledgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $knowledge = $this->route('faq');
        $knowledgeId = $knowledge instanceof knowledge ? $knowledge->id : $knowledge;

        return [
            'title' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z\pL].*$/u',
                function ($attribute, $value, $fail) use ($knowledgeId) {
                    $normalizedValue = mb_strtolower(str_replace(' ', '', $value));
                    $query = knowledge::withTrashed()
                        ->whereRaw('LOWER(REPLACE(title, " ", "")) = ?', [$normalizedValue]);
                    
                    if ($knowledgeId) {
                        $query->where('id', '!=', $knowledgeId);
                    }

                    $exists = $query->first();

                    if ($exists) {
                        $exists->trashed()
                            ? $fail('Este conocimiento está en la papelera. Ve a la sección de desactivados para restaurarla.')
                            : $fail('Ya existe otro conocimiento activo con este título.');
                    }
                },
            ],
            'content_response' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'creation_date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.string' => 'El título debe ser una cadena de texto.',
            'title.max' => 'El título no puede superar los 100 caracteres.',
            'title.regex' => 'El título debe comenzar con una letra.',
            'content_response.required' => 'La respuesta es obligatoria.',
            'content_response.string' => 'La respuesta debe ser una cadena de texto.',
            'content_response.max' => 'La respuesta no puede superar los 255 caracteres.',
            'category_id.required' => 'Debes seleccionar una categoría.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',
            'creation_date.required' => 'La fecha de creación es obligatoria.',
            'creation_date.date' => 'La fecha de creación no tiene un formato válido.',
            'creation_date.before_or_equal' => 'La fecha de creación no puede ser posterior a hoy.',
        ];
    }
}
