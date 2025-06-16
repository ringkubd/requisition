<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends AppBaseController
{
    public function index()
    {
        \dd(ActivityResource::collection(Activity::with('causer')->latest()->limit(10)->get()));
        return $this->sendResponse(ActivityResource::collection(Activity::with('causer')->latest()->get()), "Activity data retrived");
    }
}
