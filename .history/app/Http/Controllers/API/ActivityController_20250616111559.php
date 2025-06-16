<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends AppBaseController
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        return \response()->json([
            'data' => ActivityResource::collection(Activity::with('causer')->latest()->paginate($perPage)),
            'message' => 'Activity data retrieved successfully',
            'status' => 'success',
        ], 200);

        return $this->sendResponse(ActivityResource::collection(Activity::with('causer')->latest()->paginate($perPage)), "Activity data retrived");
    }
}
