<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlaPlan extends Model
{
    protected $fillable = [
        'name',
        'grace_time_hours',
        'working_hours'
    ];

    public function helpTopics()
    {
        return $this->hasMany(HelpTopic::class, 'division_id');
    }
}
