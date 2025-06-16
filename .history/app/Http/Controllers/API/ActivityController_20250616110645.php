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
        return $this->sendResponse(ActivityResource::collection(Activity::with('causer')->latest()->paginate()), "Activity data retrived");
    }
}
