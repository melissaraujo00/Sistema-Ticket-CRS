<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreCategoryRequest $request)
    {
        Category::create($request->validated());

        return back()->with('success', 'Categoría creada con éxito.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Display soft delete resorces
     */
    public function showSoftDelete()
    {
        return response()->json(Category::onlyTrashed()->get());
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return back()->with('success', 'Categoría actualizada con éxito.');
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return back()->with('success', 'Categoría desactivada con éxito.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
         Category::withTrashed()->findOrFail($id)->restore();

         return back()->with('success', 'Categoría restaurada con éxito.');
    }

    /**
     * Permanent remove the specified resource from storage.
     */
    public function forceDelete($id)
    {
        Category::withTrashed()->findOrFail($id)->forceDelete();

        return back()->with('success', 'Categoría eliminada permanentemente.');
    }
}
