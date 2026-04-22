<?php

use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Http\Controllers\SlaPlanController;
use App\Http\Controllers\PriorityController;
use App\Http\Controllers\TecnicoController;
use App\Http\Controllers\TicketController;

// ==========================================
// 1. RUTAS PÚBLICAS
// ==========================================
Route::get('/', [PublicController::class, 'index'])->name('home');

// ==========================================
// 2. RUTAS AUTENTICADAS
// ==========================================
Route::middleware(['auth'])->group(function () {

    // --- A. ACCESO GENERAL ---
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/faqs', [PublicController::class, 'faqs'])->name('faqs.index');

    // --- B. ASIGNACIÓN DE TICKETS (Debe ir ANTES del resource de tickets) ---
    Route::middleware(['permission:assign_tickets'])->group(function () {
        Route::get('/tickets/pendientes', [TicketController::class, 'unassigned'])->name('tickets.unassigned');
        Route::post('/tickets/{ticket}/asignar', [TicketController::class, 'assign'])->name('tickets.assign');
    });

    // --- C. CRUD DE TICKETS (Debe ir DESPUÉS de las estáticas de tickets) ---
    Route::resource('tickets', TicketController::class);

    // --- D. ÁREA TÉCNICA (Agentes y Admins de Área) ---
    Route::middleware(['role:agent|admin'])->prefix('agent')->group(function () {

        Route::get('/dashboard', function () {
            return redirect()->route('dashboard');
        })->name('agent.dashboard');

        Route::get('/area-dashboard', function () {
            return redirect()->route('dashboard');
        })->name('admin.dashboard');




        Route::get('/ticket/{id}', function ($id) {
            return Inertia::render('dashboards/detalleTicket', ['id' => $id]);
        })->name('agent.ticket');

        Route::get('/total-asignados', [TecnicoController::class, 'totalTicketsAsignados']);
        Route::get('/total-en-proceso', [TecnicoController::class, 'totalTicketsEnProceso']);
        Route::get('/total-resueltos', [TecnicoController::class, 'totalTicketsResueltos']);
        Route::get('/historial-finalizados', [TecnicoController::class, 'historialTicketsFinalizados']);

        Route::get('/mis-estadisticas', [TecnicoController::class, 'misEstadisticas']);
        Route::get('/tasa-resolucion', [TecnicoController::class, 'tasaResolucion']);

        Route::get('/tickets-en-cola', [TecnicoController::class, 'ticketsEnCola']);
        Route::get('/tickets-en-proceso', [TecnicoController::class, 'ticketsEnProceso']);
        Route::get('/dashboard-data', [TecnicoController::class, 'dashboardData']);
        Route::get('/tickets-asignados', [TecnicoController::class, 'ticketsAsignados']);
        Route::get('/ver-ticket/{id}', [TecnicoController::class, 'verTicket']);
        Route::post('/ticket/{id}/diagnostico', [TecnicoController::class, 'guardarDiagnostico']);
    });

    // --- E. CONFIGURACIÓN Y CATÁLOGOS ---
    Route::middleware(['permission:manage_catalogs'])->group(function () {
        Route::resource('sla-plans', SlaPlanController::class);
        Route::resource('priorities', PriorityController::class);
    });

    // --- F. GESTIÓN DE USUARIOS ---
    Route::middleware(['permission:manage_users'])->group(function () {
        Route::resource('users', UserController::class);
    });

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
