<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SlaPlanController;
use App\Http\Controllers\PriorityController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas de SLA Plans
    Route::get('/sla-plans',        [SlaPlanController::class, 'index'])->name('sla-plans.index');
    Route::get('/sla-plans/create', [SlaPlanController::class, 'create'])->name('sla-plans.create');
    Route::post('/sla-plans',       [SlaPlanController::class, 'store'])->name('sla-plans.store');
    Route::resource('priorities', PriorityController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
