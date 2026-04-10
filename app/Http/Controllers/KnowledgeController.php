<?php

namespace App\Http\Controllers;

use App\Models\knowledge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $knowledges = knowledge::with('category')->get();

        return Inertia::render('welcome', [
            'knowledges' => $knowledges
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(knowledge $knowledge)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(knowledge $knowledge)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, knowledge $knowledge)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(knowledge $knowledge)
    {
        //
    }
}
