<?php

use App\Http\Controllers\Tickets\TicketController;
use App\Http\Controllers\Tickets\TicketAssignmentController;
use App\Http\Controllers\Tickets\TicketNoteController;
use App\Http\Controllers\TicketHistoryController;
use Illuminate\Support\Facades\Route;

// ── Rutas específicas ANTES del resource ──────────────────────

// Usuario final (sin restricción de permiso extra, solo auth)
Route::get('/mis-tickets', [TicketController::class, 'myTickets'])->name('tickets.my');
Route::put('/tickets/{ticket}/cancel', [TicketController::class, 'cancel'])->name('tickets.cancel');
Route::post('/tickets/{ticket}/close', [TicketController::class, 'close'])->name('tickets.close'); // ← fuera del grupo assign_tickets

// ── Asignador / Jefe (requiere permiso assign_tickets) ────────
Route::middleware(['permission:assign_tickets'])->group(function () {
    Route::get('/tickets/pendientes', [TicketAssignmentController::class, 'unassigned'])->name('tickets.unassigned');
    Route::get('/tickets/{ticket}/asignador', [TicketAssignmentController::class, 'showAsignador'])->name('tickets.showAsignador');
    Route::put('/tickets/{ticket}', [TicketAssignmentController::class, 'update'])->name('tickets.update');
    Route::post('/tickets/{ticket}/admin-close', [TicketAssignmentController::class, 'adminClose'])->name('tickets.adminClose');
});

// ── CRUD base ─────────────────────────────────────────────────
Route::resource('tickets', TicketController::class)->except(['destroy', 'update']);
Route::resource('tickets.history', TicketHistoryController::class)->only(['index']);

// ── Notas internas ────────────────────────────────────────────
Route::post('/tickets/{ticket}/nota-interna', [TicketNoteController::class, 'store'])->name('tickets.notaInterna');
