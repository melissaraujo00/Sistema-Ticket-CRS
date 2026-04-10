<?php

use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Http\Controllers\SlaPlanController;
use App\Http\Controllers\PriorityController;

Route::get('/', [PublicController::class, 'index'])->name('home');

Route::middleware(['auth'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    // Rutas de SLA Plans
    Route::get('/sla-plans',        [SlaPlanController::class, 'index'])->name('sla-plans.index');
    Route::get('/sla-plans/create', [SlaPlanController::class, 'create'])->name('sla-plans.create');
    Route::post('/sla-plans',       [SlaPlanController::class, 'store'])->name('sla-plans.store');
    Route::resource('priorities', PriorityController::class);

    Route::middleware(['role:admin'])->group(function () {
        Route::resource('users', UserController::class);
    });


});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
