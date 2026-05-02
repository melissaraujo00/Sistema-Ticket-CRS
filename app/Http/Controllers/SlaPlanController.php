<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSlaPlanRequest;
use App\Http\Requests\UpdatedSlaPlanRequest;
use App\Models\SlaPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SlaPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $planes = SlaPlan::all();
        return Inertia::render('sla-plans/index', [
            'planes' => $planes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $slaPlan = SlaPlan::all();
        return Inertia::render('sla-plans/create', [
            'sla-plans' => $slaPlan
        ]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSlaPlanRequest $request)
    {

        SlaPlan::create($request->validated());

        return redirect()->route('sla-plans.index')
                        ->with('success', 'Plan SLA creado exitosamente.');

    }

    /**
     * Display the specified resource.
     */
    public function show(SlaPlan $slaPlan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SlaPlan $slaPlan)
    {
        return Inertia::render('sla-plans/edit', [
        'slaPlan' => $slaPlan  
    ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatedSlaPlanRequest $request, SlaPlan $slaPlan)
    {
        $slaPlan->update($request->validated());
        return redirect()->route('sla-plans.index')->With('success', 'Sla Plan Editado Exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SlaPlan $slaPlan): RedirectResponse
    {
        $slaPlan->delete();
        return redirect()->route('sla-plans.index')->with('success', 'Plan eliminado (puede restaurarse).');
    }

    /**
    * Display a list of soft-deleted SLA Plans.
    */
    public function trashed()
    {
        $planes = SlaPlan::onlyTrashed()->get();

        return Inertia::render('sla-plans/trashed', [
            'planes' => $planes,
        ]);
    }

    /**
    * Restore a soft-deleted SLA Plan.
    */
    public function restore($id): RedirectResponse
    {
        $plan = SlaPlan::onlyTrashed()->findOrFail($id);
        $plan->restore();

        return redirect()->route('sla-plans.trashed')
            ->with('success', 'Plan SLA restaurado exitosamente.');
    }
}
