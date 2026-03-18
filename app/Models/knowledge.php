<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class knowledge extends Model
{
    protected $fillable = [
        'title',
        'content_response',
        'creation_date',
        'category_id'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function helpTopics()
    {
        return $this->hasMany(HelpTopic::class, 'division_id');
    }
}
