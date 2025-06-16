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
    /**
     * Display a listing of the activity logs.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Get query parameters with defaults
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $userId = $request->input('user_id', '');
        $model = $request->input('model', '');
        $event = $request->input('event', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        // Initialize query
        $activityQuery = \Spatie\Activitylog\Models\Activity::with(['causer']);

        // Apply filters
        if ($userId) {
            $activityQuery->where('causer_id', $userId);
        }

        if ($model) {
            $activityQuery->where('subject_type', $model);
        }

        if ($event) {
            $activityQuery->where('event', $event);
        }

        // Apply date range filter
        if ($startDate && $endDate) {
            $activityQuery->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);
        }

        // Apply search
        if ($search) {
            $activityQuery->where(function ($query) use ($search) {
                $query->where('description', 'LIKE', "%{$search}%")
                    ->orWhere('event', 'LIKE', "%{$search}%")
                    ->orWhere('subject_type', 'LIKE', "%{$search}%")
                    ->orWhereHas('causer', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        $activityQuery->orderBy($sortField, $sortDirection);

        // Execute query with pagination
        $activities = $activityQuery->paginate($perPage, ['*'], 'page', $page);

        // Return JSON response
        return response()->json([
            'data' => $activities->items(),
            'total' => $activities->total(),
            'per_page' => $activities->perPage(),
            'current_page' => $activities->currentPage(),
            'last_page' => $activities->lastPage()
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
