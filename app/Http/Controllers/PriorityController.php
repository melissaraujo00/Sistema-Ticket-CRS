<?php

namespace App\Http\Controllers;

use App\Models\Priority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StorePriorityRequest;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\UpdatePriorityRequest;

class PriorityController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function __construct()
    {
        $this->authorizeResource(Priority::class);
    }
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
    public function edit(Priority $priority)
    {
        return Inertia::render('priorities/edit', [
            'priority' => $priority
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePriorityRequest $request, Priority $priority): RedirectResponse 
    {
        $priority->update($request->validated());

        return redirect()->route('priorities.index')->with('success', 'Priority updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Priority $priority): RedirectResponse 
    {
        $priority->delete();

        return redirect()->route('priorities.index')->with('success', 'Priority deleted successfully.');
    }
}
