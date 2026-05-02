<?php

namespace App\Http\Controllers;

use App\Models\knowledge;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $knowledges = knowledge::with('category')->latest()->paginate(10);
        $categories = Category::all();
        return Inertia::render('faqs/Faq', [
            'knowledges' => $knowledges,
            'categories' => $categories,
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
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'content_response' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'creation_date' => 'required|date',
        ]);

        knowledge::create($validated);

        return back()->with('success', 'FAQ creada con éxito.');
    }

    /**
     * Display the specified resource.
     */
    public function show(knowledge $knowledge)
    {
        return response()->json($knowledge->load('category'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(knowledge $knowledge)
    {
        return response()->json($knowledge);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, knowledge $faq)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'content_response' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'creation_date' => 'required|date',
        ]);

        $faq->update($validated);

        return back()->with('success', 'FAQ actualizada con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(knowledge $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ eliminada con éxito.');
    }
}
