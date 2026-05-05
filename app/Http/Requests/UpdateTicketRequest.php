<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        // Solo los usuarios con permiso de asignar pueden pasar
        return $this->user()->can('assign_tickets');
    }

    /**
     * Reglas de validación aplicadas a la petición.
     */
    public function rules(): array
    {
        // Obtenemos el ticket actual desde la ruta para comparar
        $ticket = $this->route('ticket');

        // Verificamos si el jefe seleccionó un departamento diferente
        $seCambioDepartamento = intval($this->department_id) !== intval($ticket->department_id);

        // 1. Reglas base (siempre son obligatorias)
        $rules = [
            'department_id' => 'required|exists:departments,id',
            'division_id'   => 'nullable|exists:divisions,id',
        ];

        // 2. Lógica condicional
        if ($seCambioDepartamento) {
            // Si cambia de área, los datos técnicos no son obligatorios
            $rules['help_topic_id'] = 'nullable|exists:help_topics,id';
            $rules['sla_plan_id']   = 'nullable|exists:sla_plans,id';
            $rules['priority_id']   = 'nullable|exists:priorities,id';
            $rules['assigned_user'] = 'nullable|exists:users,id';
        } else {
            // Si NO cambia de área, TIENE que llenar los datos para asignarlo
            $rules['help_topic_id'] = 'required|exists:help_topics,id';
            $rules['sla_plan_id']   = 'required|exists:sla_plans,id';
            $rules['priority_id']   = 'required|exists:priorities,id';
            $rules['assigned_user'] = 'required|exists:users,id';
        }

        return $rules;
    }

    /**
     * Mensajes de error personalizados (opcional).
     */
    public function messages(): array
    {
        return [
            'sla_plan_id.required'   => 'El plan SLA es obligatorio para asignar el ticket.',
            'priority_id.required'   => 'La prioridad es obligatoria para asignar el ticket.',
            'assigned_user.required' => 'Debes seleccionar un técnico para la asignación.',
            'help_topic_id.required' => 'El tema de ayuda es obligatorio.',
        ];
    }
}
