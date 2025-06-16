<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends AppBaseController
{
    // Example in Laravel

    public function index(Request $request)
    {
        $query = Activity::query();

        // Search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('description', 'like', "%{$searchTerm}%")
                    ->orWhere('event', 'like', "%{$searchTerm}%")
                    ->orWhere('subject_type', 'like', "%{$searchTerm}%")
                    ->orWhereHas('causer', function ($subq) use ($searchTerm) {
                        $subq->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Sorting
        $sortField = $request->sort_field ?: 'created_at';
        $sortDirection = $request->sort_direction ?: 'desc';

        // Handle relation sorting
        if ($sortField === 'causer_name') {
            $query->join('users', 'activity_log.causer_id', '=', 'users.id')
                ->orderBy('users.name', $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Pagination
        $perPage = $request->per_page ?: 10;
        $result = $query->with('causer', 'subject')->paginate($perPage);

        return response()->json([
            'activity' => $result,
            'meta' => [
                'total' => $result->total(),
                'current_page' => $result->currentPage(),
                'last_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
            ]
        ]);
    }
}
