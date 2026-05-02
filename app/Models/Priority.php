<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Priority extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'color',
        'level'
    ];

    public function helpTopics()
    {
        return $this->hasMany(HelpTopic::class, 'division_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function slaPlan()
    {
        return $this->belongsTo(SlaPlan::class, 'sla_plan_id');
    }
}
