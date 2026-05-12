<?php

namespace App\Models;

use App\Enums\ActionTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketHistory extends Model
{


    protected $fillable = [
        'ticket_id',
        'user_id',
        'action_type',
        'assigned_user',
        'internal_note',
        'previous_department',
        'new_department'
    ];

    protected $casts = [
        'action_type' => ActionTypeEnum::class,
    ];

    /**
     * El ticket al que pertenece este registro de historial.
     */
    public function ticket():BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * El usuario que realizó la acción (quien hizo el cambio).
     */
    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * El técnico al que se le asignó el ticket en esta acción.
     * Le pasamos el nombre de la columna para que Laravel no se confunda.
     */
    public function assignedTo():BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user');
    }

    /**
     * El departamento desde el cual se transfirió el ticket.
     */
    public function previousDepartment():BelongsTo
    {
        return $this->belongsTo(Department::class, 'previous_department');
    }

    /**
     * El departamento hacia el cual se transfirió el ticket.
     */
    public function newDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'new_department');
    }

    /**
     * Accessor para obtener el nombre legible de la acción.
     */
    public function getActionAttribute(): string
    {
        return $this->action_type ? $this->action_type->label() : 'Acción desconocida';
    }

    /**
     * Accessor para obtener detalles de la acción.
     */
    public function getDetailsAttribute(): string
    {
        if ($this->internal_note) {
            return $this->internal_note;
        }

        return match ($this->action_type) {
            ActionTypeEnum::CREATED => 'Ticket ingresado al sistema.',
            ActionTypeEnum::ASSIGNED => $this->assignedTo ? "Asignado a: {$this->assignedTo->name}" : 'Ticket asignado.',
            ActionTypeEnum::DEPARTMENT_TRANSFERRED => ($this->previousDepartment && $this->newDepartment) 
                ? "Transferido de {$this->previousDepartment->name} a {$this->newDepartment->name}" 
                : 'Ticket transferido de departamento.',
            ActionTypeEnum::STATUS_CHANGED => 'El estado del ticket ha sido actualizado.',
            default => 'Sin detalles adicionales.',
        };
    }
}
