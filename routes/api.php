<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RequestTicketController;
use App\Http\Controllers\PriorityController;

Route::post('/requestTicket', [RequestTicketController::class, 'store']);
