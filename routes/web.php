<?php

use App\Http\Controllers\NotificationController;
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
Route::get('/faqs', [PublicController::class, 'faqs'])->name('faqs.index');

// ==========================================
// 2. RUTAS AUTENTICADAS
// ==========================================
Route::middleware(['auth'])->group(function () {

    // --- A. DASHBOARD PRINCIPAL ---
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

   Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/notifications/fetch', [NotificationController::class, 'fetch'])->name('notifications.fetch');

    

    Route::post('/tickets/{ticket}/asignar', [TicketController::class, 'assign'])->name('tickets.assign');
    // ==========================================
    // NUEVO: RUTAS ESPECÍFICAS PARA TICKETS (antes del resource)
    // ==========================================

    // Mis Tickets (solo los del usuario actual)
    // Permiso sugerido: 'view_own_tickets'
    Route::get('/mis-tickets', [TicketController::class, 'myTickets'])->name('tickets.my');

    // Tickets pendientes de asignación (ya existía)
    Route::middleware(['permission:assign_tickets'])->group(function () {
        Route::get('/tickets/pendientes', [TicketController::class, 'unassigned'])->name('tickets.unassigned');
        Route::post('/tickets/{ticket}/asignar', [TicketController::class, 'assign'])->name('tickets.assign');
    });



    // --- C. CRUD DE TICKETS con permisos granulares ---
    // MODIFICADO: Se añaden middlewares de permiso a cada método del resource
    // Para que no tengas que duplicar rutas, usamos ->middleware() en el resource
    Route::resource('tickets', TicketController::class);

    // Rutas de SLA Plans
    Route::get('/sla-plans/trashed', [SlaPlanController::class, 'trashed'])->name('sla-plans.trashed');
    Route::put('/sla-plans/{id}/restore', [SlaPlanController::class, 'restore'])->name('sla-plans.restore');
    Route::resource('/sla-plans',  SlaPlanController::class);
    // Rutas de prioridades
    Route::resource('priorities', PriorityController::class);
    // --- D. ÁREA TÉCNICA (técnicos y administradores) ---
    Route::middleware(['role:agent|admin'])->prefix('agent')->group(function () {Route::get('/dashboard', function () {
        return Inertia::render('dashboards/agent-dashboard');
        })->name('agent.dashboard');

        Route::get('/ticket/{id}', function ($id) {
            return Inertia::render('dashboards/detalleTicket', ['id' => $id]);
        })->name('agent.ticket');

        // Rutas de estadísticas (sin cambios)
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
        Route::post('/ticket/{id}/no-resolver', [TecnicoController::class, 'noPuedeResolver']);
    });

    // --- E. CATÁLOGOS (solo usuarios con permiso) ---
    Route::middleware(['permission:manage_catalogs'])->group(function () {
        Route::resource('sla-plans', SlaPlanController::class);
        Route::resource('priorities', PriorityController::class);
    });

    // --- F. GESTIÓN DE USUARIOS ---
    Route::middleware(['permission:manage_users'])->group(function () {
        Route::resource('users', UserController::class);
    });
});

// ==========================================
// 3. ARCHIVOS ADICIONALES
// ==========================================
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
