<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'email_department',
        'area_id',

    ];

    public function area():BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Historial de tickets que salieron de este departamento (transferidos a otro).
     */
    public function outgoingTransfers():HasMany
    {
        return $this->hasMany(TicketHistory::class, 'previous_department');
    }

    /**
     * Historial de tickets que entraron a este departamento (transferidos desde otro).
     */
    public function incomingTransfers():HasMany
    {
        return $this->hasMany(TicketHistory::class, 'new_department');
    }

    public function heads()
{
    return $this->belongsToMany(User::class, 'department_user')
                ->wherePivot('role', 'head')
                ->withTimestamps();
}
}
