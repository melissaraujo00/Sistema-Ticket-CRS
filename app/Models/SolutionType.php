<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolutionType extends Model
{
    protected $fillable = [
        'name', 'description', 'department_id', 'help_topic_id', 'is_active'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function helpTopic()
    {
        return $this->belongsTo(HelpTopic::class);
    }

    public function ticketSolutions()
    {
        return $this->hasMany(TicketSolution::class);
    }
}
