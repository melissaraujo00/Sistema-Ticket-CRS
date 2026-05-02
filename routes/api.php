<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RequestTicketController;


Route::post('/requestTicket', [RequestTicketController::class, 'store']);
