<?php

namespace App\Actions;

use App\Models\Ticket;
use Illuminate\Support\Carbon;

class GenerateTicketCodeAction
{
    public function execute(): string
    {
        $prefix = 'TKT';
        $date = Carbon::now()->format('Ymd');
        $lastTicket = Ticket::whereDate('creation_date', Carbon::today())
            ->orderBy('id', 'desc')->first();
        $sequence = $lastTicket ? intval(substr($lastTicket->code, -4)) + 1 : 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }
}
