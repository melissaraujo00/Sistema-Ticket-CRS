<?php

namespace App\Http\Controllers;

use App\Models\Priority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StorePriorityRequest;
use Illuminate\Http\RedirectResponse;

class PriorityController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    
    public function index()
    {
        return Inertia::render('priorities/index', [
            'priorities' => Priority::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $priorities = Priority::all();

        return Inertia::render('priorities/create', [
            'priorities' => $priorities
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePriorityRequest $request):RedirectResponse
    {
        Priority::create($request->validated());

        return redirect()->route('priorities.index')->with('success', 'Priority created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
