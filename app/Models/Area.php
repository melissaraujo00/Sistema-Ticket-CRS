<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Area extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description'
    ];

    // 1. RELACIÓN DE DEPARTAMENTOS: Un área tiene muchos departamentos (ESTA FALTABA)
    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    // 2. RELACIÓN DE TICKETS: Un área tiene muchos tickets a través de los departamentos
    public function tickets(): HasManyThrough
    {
        return $this->hasManyThrough(Ticket::class, Department::class);
    }
}
