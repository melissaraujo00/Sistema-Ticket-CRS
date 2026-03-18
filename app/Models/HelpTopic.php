<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HelpTopic extends Model
{
    protected $fillable = [
        'name_topic',
        'division_id',
        'sla_plan_id',
        'knowledge_id',
        'priority_id'
    ];

    public function slaPlan(): BelongsTo
    {
        return $this->belongsTo(SlaPlan::class);
    }

    public function knowledge(): BelongsTo
    {
        return $this->belongsTo(Knowledge::class);
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(Priority::class);
    }
}
