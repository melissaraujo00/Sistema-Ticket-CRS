<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'institution_code',
        'email',
        'phone_number',
        'ext',
        'password',
        'birthdate',
        'is_active',
        'department_id'
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed',];
    }

    public function ticketsRequested(): HasMany
    {
        return $this->hasMany(Ticket::class, 'requesting_user');
    }

    public function ticketsAssigned(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_user');
    }

    public function ticketSolutions(): HasMany
    {
        return $this->hasMany(TicketSolution::class);
    }

    /**
     * Historial de todas las acciones que ha realizado este usuario en el sistema.
     */
    public function actionsPerformed(): HasMany
    {
        return $this->hasMany(TicketHistory::class, 'user_id');
    }

    /**
     * Historial de todas las veces que le han asignado un ticket a este técnico.
     */
    public function ticketAssignments(): HasMany
    {
        return $this->hasMany(TicketHistory::class, 'assigned_user');
    }

    public function headedDepartments()
    {
        return $this->belongsToMany(Department::class, 'department_user')
            ->wherePivot('role', 'head')
            ->withTimestamps();
    }
}
