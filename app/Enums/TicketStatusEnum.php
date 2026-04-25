<?php

namespace App\Enums;

enum TicketStatusEnum: string
{
    case PENDING_ASSIGNMENT = 'Pendiente a asignación';
    case ASSIGNED = 'Asignado';
    case OPEN = 'Abierto';
    case IN_PROGRESS = 'En Proceso';
    case RESOLVED = 'Resuelto';
    case CLOSED = 'Cerrado';
    case UNRESOLVED = 'No Resuelto';

    public function label(): string
    {
        return $this->value;
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING_ASSIGNMENT => 'gray',
            self::ASSIGNED => 'blue',
            self::OPEN => 'green',
            self::IN_PROGRESS => 'orange',
            self::RESOLVED => 'green',
            self::CLOSED => 'gray',
            self::UNRESOLVED => 'red',
        };
    }
}
