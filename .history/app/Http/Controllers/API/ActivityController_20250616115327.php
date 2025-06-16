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
        $query->when($request->has('model'), function ($q) use ($request) {
            $q->where('subject_type', $request->model);
        });
        $query->when($request->has('event'), function ($q) use ($request) {
            $q->where('event', $request->event);
        });
        $query->when($request->has('user_id'), function ($q) use ($request) {
            $q->where('causer_id', $request->user_id);
        });
        $query->when($request->has('start_date'), function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->start_date);
        });
        $query->when($request->has('end_date'), function ($q) use ($request) {
            $q->whereDate('created_at', '<=', $request->end_date);
        });

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

    public function users()
    {
        // Return users who have activity logs
        $users = \App\Models\User::whereHas('activities')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    public function models()
    {
        // Return unique model types from activity logs
        $models = Activity::distinct()
            ->pluck('subject_type')
            ->filter()
            ->values();

        return response()->json($models);
    }

    public function events()
    {
        // Return unique event types from activity logs
        $events = Activity::distinct()
            ->pluck('event')
            ->filter()
            ->values();

        return response()->json($events);
    }
}
