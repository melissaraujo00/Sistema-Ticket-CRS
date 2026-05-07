<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KnowledgeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Http\Controllers\SlaPlanController;
use App\Http\Controllers\PriorityController;
use App\Http\Controllers\TecnicoController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\QualificationController;
use App\Http\Controllers\SolutionTypeController;
use App\Http\Controllers\DashboardController;


// ❌ Quitar: use App\Http\Controllers\TicketController;
// ❌ Quitar: use App\Http\Controllers\TicketHistoryController;
// ✅ Los controladores de tickets se importan dentro de tickets.php

// ==========================================
// 1. RUTAS PÚBLICAS
// ==========================================
Route::get('/', [PublicController::class, 'index'])->name('home');


//-----prueva del json
   Route::get('ratings-dashboard', [\App\Http\Controllers\TechnicalRatingsController::class, 'index'])
      ->name('ratings.dashboard');

// ==========================================
// 2. RUTAS AUTENTICADAS
// ==========================================
Route::middleware(['auth'])->group(function () {

    // --- A. DASHBOARD PRINCIPAL ---
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // --- B. NOTIFICACIONES ---
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/notifications/fetch', [NotificationController::class, 'fetch'])->name('notifications.fetch');

    // --- C. TICKETS (archivo separado) ---
    // ✅ Hereda el middleware 'auth' automáticamente por estar dentro del grupo
    require base_path('routes/tickets.php');

    // --- D. SLA PLANS ---
    Route::get('/sla-plans/trashed', [SlaPlanController::class, 'trashed'])->name('sla-plans.trashed');
    Route::put('/sla-plans/{id}/restore', [SlaPlanController::class, 'restore'])->name('sla-plans.restore');
    Route::resource('/sla-plans', SlaPlanController::class);

    // --- E. PRIORIDADES ---
    Route::resource('priorities', PriorityController::class);

    // --- F. ÁREA TÉCNICA (agente | admin) ---
    Route::middleware(['role:agent|admin'])->prefix('agent')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('dashboards/agent-dashboard');
        })->name('agent.dashboard');

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
        Route::post('/ticket/{id}/no-resolver', [TecnicoController::class, 'noPuedeResolver']);
        Route::get('/descargar-adjunto/{id}', [TecnicoController::class, 'descargarAdjunto'])->name('agent.descargar-adjunto');
    });

    // --- G. CATÁLOGOS ---
    Route::middleware(['permission:manage_catalogs'])->group(function () {
        Route::resource('sla-plans', SlaPlanController::class);
        Route::resource('priorities', PriorityController::class);
    });

    // --- H. GESTIÓN DE USUARIOS ---
    Route::middleware(['permission:manage_users'])->group(function () {
        Route::resource('users', UserController::class);
    });


    Route::post('/qualifications', [QualificationController::class, 'store']);

    // Knowledge
    Route::middleware(['role:superadmin'])->group(function () {
        Route::resource('category', CategoryController::class);
    });

    Route::middleware(['role:superadmin'])->group(function () {
        Route::resource('faq', KnowledgeController::class);
    });

});

// ==========================================
// 3. ARCHIVOS ADICIONALES
// ==========================================
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
