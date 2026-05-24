<?php

namespace App\Enums;

enum ActionTypeEnum: string
{
    // Creación inicial
    case CREATED = 'created';

    // Cambios de clasificación
    case STATUS_CHANGED = 'status_changed';
    case PRIORITY_CHANGED = 'priority_changed';
    case DEPARTMENT_TRANSFERRED = 'department_transferred';

    // Asignación de personal
    case ASSIGNED = 'assigned';
    case UNASSIGNED = 'unassigned';

    // Interacciones (opcional, si quieres registrar en el historial que alguien comentó)
    case REPLY_ADDED = 'reply_added';
    case NOTE_ADDED = 'note_added';

    // Cierre o reapertura
    case CLOSED = 'closed';
    case REOPENED = 'reopened';
    case SLA_PAUSED = 'sla_paused';
    case SLA_RESUMED = 'sla_resumed';
    case SLA_EXPIRED = 'sla_expired';
    case SLA_MET = 'sla_met';
    case SLA_PLAN_CHANGED = 'sla_plan_changed';

    // Para el frontend en español
    public function label(): string
    {
        return match($this) {
            self::CREATED => 'Ticket Creado',
            self::STATUS_CHANGED => 'Cambio de Estado',
            self::PRIORITY_CHANGED => 'Cambio de Prioridad',
            self::DEPARTMENT_TRANSFERRED => 'Transferido de Departamento',
            self::ASSIGNED => 'Ticket Asignado',
            self::UNASSIGNED => 'Ticket Desasignado',
            self::REPLY_ADDED => 'Respuesta Agregada',
            self::NOTE_ADDED => 'Nota Privada Agregada',
            self::CLOSED => 'Ticket Cerrado',
            self::REOPENED => 'Ticket Reabierto',
            self::SLA_PAUSED => 'SLA Pausado',
            self::SLA_RESUMED => 'SLA Reanudado',
            self::SLA_EXPIRED => 'SLA Incumplido',
            self::SLA_MET => 'SLA Cumplido',
            self::SLA_PLAN_CHANGED => 'Cambio de Plan SLA',
        };
    }
}
