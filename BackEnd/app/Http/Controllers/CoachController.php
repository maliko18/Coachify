<?php

namespace App\Http\Controllers;

use App\Http\Resources\CoachCollection;
use App\Models\Coach;
use Illuminate\Http\Request;

class CoachController extends Controller
{
    /**
     * Liste tous les coachs disponibles.
     */
    public function index(Request $request): CoachCollection
    {
        $query = Coach::query()->with('user');

        if ($request->boolean('available_only')) {
            $query->where('is_available', true);
        }

        $coaches = $query->orderByDesc('created_at')->get();

        return new CoachCollection($coaches);
    }
}
