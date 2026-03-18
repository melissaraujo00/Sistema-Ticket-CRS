<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Priority extends Model
{
    protected $fillable = [
        'name',
        'color',
        'level'
    ];

    public function helpTopics()
    {
        return $this->hasMany(HelpTopic::class, 'division_id');
    }
}
