<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->id : $category;

        return [
            'name' => [
                'required',
                'string',
                'max:60',
                'regex:/^[a-zA-Z\pL].*$/u',
                function ($attribute, $value, $fail) use ($categoryId) {
                    $normalizedValue = mb_strtolower(str_replace(' ', '', $value));
                    $exists = Category::withTrashed()
                        ->where('id', '!=', $categoryId)
                        ->whereRaw('LOWER(REPLACE(name, " ", "")) = ?', [$normalizedValue])
                        ->first();

                    if ($exists) {
                        $exists->trashed()
                            ? $fail('Esta categoría está en la papelera. Ve a la sección de desactivados para restaurarla.')
                            : $fail('Ya existe otra categoría activa con este nombre.');
                    }
                },
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto válida.',
            'name.max' => 'El nombre no puede superar los 60 caracteres.',
            'name.regex' => 'El nombre debe comenzar con una letra.',
            'description.string' => 'La descripción debe ser una cadena de texto.',
        ];
    }
}
