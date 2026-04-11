<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HelpTopic extends Model
{
    use HasFactory, SoftDeletes;

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

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
