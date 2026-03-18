<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description'
    ];

    public function knowledge(): HasMany
    {
        return $this->hasMany(knowledge::class);
    }
}
