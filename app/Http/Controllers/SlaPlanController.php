<?php

namespace App\Http\Controllers;

use App\Models\SlaPlan;
use Illuminate\Http\Request;

class SlaPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $planes = SlaPlan::all();
        return view('sla_plans.index', compact('planes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('sla_plans.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:50',
            'grace_time_hours' => 'required|integer|min:1',
            'working_hours'    => 'required|boolean',
        ]);

        try {
            SlaPlan::create($request->all());
            return redirect()->route('sla-plans.index')
                             ->with('success', 'Plan SLA creado exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al guardar. Intente nuevamente.');
        }
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
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SlaPlan $slaPlan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SlaPlan $slaPlan)
    {
        //
    }
}
