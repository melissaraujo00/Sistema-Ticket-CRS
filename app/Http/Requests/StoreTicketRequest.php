<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
            'department_id' => 'required|exists:departments,id',
            'division_id'   => 'required|exists:divisions,id',
            'help_topic_id' => 'required|exists:help_topics,id',
            'subject'       => 'required|string|max:200',
            'message'       => 'required|string',
            'attachments'   => 'nullable|array',
        'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx',
        ];
    }

    public function messages(): array
    {
        return [
            'department_id.required' => 'El departamento es obligatorio.',
            'division_id.required'   => 'La división es obligatoria.',
            'help_topic_id.required' => 'El tema de ayuda es obligatorio.',
            'subject.required'       => 'El asunto es obligatorio.',
            'subject.max'            => 'El asunto no puede superar los 200 caracteres.',
            'message.required'       => 'El mensaje es obligatorio.',
            'attachments.*.max'   => 'Cada archivo no debe superar los 10MB.',
        'attachments.*.mimes' => 'Archivos permitidos: JPG, PNG, PDF, DOC, DOCX.',
        ];
    }
}
