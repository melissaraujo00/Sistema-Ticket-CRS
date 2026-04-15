<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketSolution extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
        'date',
        'attach',
        'type'
    ];

    protected $casts = [  'date' => 'date',
                            'attach' => 'array'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }
}
