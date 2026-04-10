<?php

namespace App\Http\Controllers;

use App\Models\knowledge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    //
    public function index()
    {
        $knowledges = knowledge::with('category')->get();

        return Inertia::render('welcome', [
            'knowledges' => $knowledges
        ]);
    }
}
