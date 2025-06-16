<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use OpenApi\Annotations as OA;

/**
 * Class ActivityController
 * 
 * @package App\Http\Controllers\API
 * 
 * Controller for managing activity logs using Spatie Activity Log package.
 * Provides endpoints for viewing, filtering, and searching activity logs with pagination.
 */
class ActivityController extends AppBaseController
{
    /**
     * @OA\Get(
     *      path="/activity-logs",
     *      summary="Get activity logs",
     *      tags={"Activity Logs"},
     *      description="Retrieve a paginated list of activity logs with filtering, searching, and sorting capabilities",
     *      @OA\Parameter(
     *          name="page",
     *          in="query",
     *          description="Page number for pagination",
     *          required=false,
     *          @OA\Schema(type="integer", default=1, minimum=1)
     *      ),
     *      @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          description="Number of items per page",
     *          required=false,
     *          @OA\Schema(type="integer", default=10, minimum=1, maximum=100)
     *      ),
     *      @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search term to filter logs by description, event, subject_type, or causer name",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="sort_field",
     *          in="query",
     *          description="Field to sort by",
     *          required=false,
     *          @OA\Schema(type="string", default="created_at", enum={"created_at", "event", "subject_type", "description"})
     *      ),
     *      @OA\Parameter(
     *          name="sort_direction",
     *          in="query",
     *          description="Sort direction",
     *          required=false,
     *          @OA\Schema(type="string", default="desc", enum={"asc", "desc"})
     *      ),
     *      @OA\Parameter(
     *          name="user_id",
     *          in="query",
     *          description="Filter by user ID who caused the activity",
     *          required=false,
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Parameter(
     *          name="model",
     *          in="query",
     *          description="Filter by subject model type (e.g., App\\Models\\User)",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="event",
     *          in="query",
     *          description="Filter by event type (e.g., created, updated, deleted)",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *      @OA\Parameter(
     *          name="start_date",
     *          in="query",
     *          description="Start date for date range filter (YYYY-MM-DD format)",
     *          required=false,
     *          @OA\Schema(type="string", format="date")
     *      ),
     *      @OA\Parameter(
     *          name="end_date",
     *          in="query",
     *          description="End date for date range filter (YYYY-MM-DD format)",
     *          required=false,
     *          @OA\Schema(type="string", format="date")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(
     *                  property="data",
     *                  type="array",
     *                  description="Array of activity log items",
     *                  @OA\Items(
     *                      type="object",
     *                      @OA\Property(property="id", type="integer", description="Activity log ID"),
     *                      @OA\Property(property="log_name", type="string", description="Log name/channel"),
     *                      @OA\Property(property="description", type="string", description="Activity description"),
     *                      @OA\Property(property="subject_type", type="string", description="Subject model class"),
     *                      @OA\Property(property="subject_id", type="integer", description="Subject model ID"),
     *                      @OA\Property(property="causer_type", type="string", description="Causer model class"),
     *                      @OA\Property(property="causer_id", type="integer", description="Causer model ID"),
     *                      @OA\Property(property="properties", type="object", description="Additional activity properties"),
     *                      @OA\Property(property="event", type="string", description="Event type"),
     *                      @OA\Property(property="batch_uuid", type="string", description="Batch UUID for grouped activities"),
     *                      @OA\Property(property="created_at", type="string", format="date-time", description="Creation timestamp"),
     *                      @OA\Property(property="updated_at", type="string", format="date-time", description="Update timestamp"),
     *                      @OA\Property(property="causer", type="object", description="User who caused the activity"),
     *                      @OA\Property(property="subject", type="object", description="Subject model that was acted upon")
     *                  )
     *              ),
     *              @OA\Property(property="total", type="integer", description="Total number of activity logs"),
     *              @OA\Property(property="per_page", type="integer", description="Items per page"),
     *              @OA\Property(property="current_page", type="integer", description="Current page number"),
     *              @OA\Property(property="last_page", type="integer", description="Last page number")
     *          )
     *      ),
     *      @OA\Response(
     *          response=400,
     *          description="Bad request - Invalid parameters"
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthorized"
     *      )
     * )
     * 
     * Display a listing of the activity logs with comprehensive filtering and pagination.
     *
     * @param Request $request The HTTP request object containing query parameters
     * @return \Illuminate\Http\JsonResponse JSON response with paginated activity logs
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
        $activityQuery = Activity::with(['causer', 'subject']);

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

    /**
     * @OA\Get(
     *      path="/activity-logs/users",
     *      summary="Get users with activity logs",
     *      tags={"Activity Logs"},
     *      description="Retrieve a list of users who have activity logs recorded",
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(
     *                  type="object",
     *                  @OA\Property(property="id", type="integer", description="User ID"),
     *                  @OA\Property(property="name", type="string", description="User name")
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthorized"
     *      )
     * )
     * 
     * Get list of users who have activity logs.
     * 
     * This endpoint returns all users who have performed actions that were logged,
     * useful for populating filter dropdowns in the frontend.
     *
     * @return \Illuminate\Http\JsonResponse JSON response with array of users
     */
    public function users()
    {
        // Return users who have activity logs
        $users = \App\Models\User::whereHas('activities')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    /**
     * @OA\Get(
     *      path="/activity-logs/models",
     *      summary="Get model types with activity logs",
     *      tags={"Activity Logs"},
     *      description="Retrieve a list of unique model types that have activity logs",
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(
     *                  type="string",
     *                  description="Model class name (e.g., App\\Models\\User)"
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthorized"
     *      )
     * )
     * 
     * Get list of unique model types from activity logs.
     * 
     * This endpoint returns all unique subject model types that have activity logs,
     * useful for filtering activities by model type in the frontend.
     *
     * @return \Illuminate\Http\JsonResponse JSON response with array of model types
     */
    public function models()
    {
        // Return unique model types from activity logs
        $models = Activity::distinct()
            ->pluck('subject_type')
            ->filter()
            ->values();

        return response()->json($models);
    }

    /**
     * @OA\Get(
     *      path="/activity-logs/events",
     *      summary="Get event types with activity logs",
     *      tags={"Activity Logs"},
     *      description="Retrieve a list of unique event types from activity logs",
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(
     *                  type="string",
     *                  description="Event type (e.g., created, updated, deleted)"
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthorized"
     *      )
     * )
     * 
     * Get list of unique event types from activity logs.
     * 
     * This endpoint returns all unique event types that have been logged,
     * such as 'created', 'updated', 'deleted', etc. Useful for filtering
     * activities by event type in the frontend.
     *
     * @return \Illuminate\Http\JsonResponse JSON response with array of event types
     */
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
