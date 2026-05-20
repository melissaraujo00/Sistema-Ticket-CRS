<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DivisionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'characteristics' => ['nullable', 'string', 'max:1000'],
            'department_id' => ['required', 'exists:departments,id'],
        ];
    }
}
