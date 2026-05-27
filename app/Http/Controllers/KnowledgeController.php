<?php

namespace App\Http\Controllers;

use App\Models\knowledge;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\SaveKnowledgeRequest;

class KnowledgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $showDeleted = $request->boolean('show_deleted');

        $knowledges = knowledge::with('category')
            ->when($showDeleted, function ($query) {
                $query->onlyTrashed();
            })
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = $request->boolean('show_deleted_categories') 
            ? Category::onlyTrashed()->get() 
            : Category::all();

        return Inertia::render('faqs/Faq', [
            'knowledges' => $knowledges,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'show_deleted', 'show_deleted_categories']),
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
    public function store(SaveKnowledgeRequest $request)
    {
        knowledge::create($request->validated());

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
    public function update(SaveKnowledgeRequest $request, knowledge $faq)
    {
        $faq->update($request->validated());

        return back()->with('success', 'FAQ actualizada con éxito.');
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     */
    public function destroy(knowledge $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ desactivada con éxito.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        knowledge::withTrashed()->findOrFail($id)->restore();

        return back()->with('success', 'FAQ restaurada con éxito.');
    }

    /**
     * Permanent remove the specified resource from storage.
     */
    public function forceDelete($id)
    {
        knowledge::withTrashed()->findOrFail($id)->forceDelete();

        return back()->with('success', 'FAQ eliminada permanentemente.');
    }
}
