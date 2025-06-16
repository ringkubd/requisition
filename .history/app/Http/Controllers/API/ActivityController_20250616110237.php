<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends AppBaseController
{
    public function index()
    {
        \dd(Activity::with('causer')->latest()->limit(10)->get());
        return $this->sendResponse(Activity::with('causer')->latest()->get(), "Activity data retrived");
    }
}
