<?php

namespace App\Http\Controllers;

use App\Models\IrfNo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InfyOm\Generator\Utils\ResponseUtil;

/**
 * @OA\Server(url="/api")
 * @OA\Info(
 *   title="InfyOm Laravel Generator APIs",
 *   version="1.0.0"
 * )
 * This class should be parent class for other API controllers
 * Class AppBaseController
 */
class AppBaseController extends Controller
{
    public function sendResponse($result, $message)
    {
        return response()->json(ResponseUtil::makeResponse($message, $result));
    }

    public function sendError($error, $code = 404)
    {
        return response()->json(ResponseUtil::makeError($error), $code);
    }

    public function sendSuccess($message)
    {
        return response()->json([
            'success' => true,
            'message' => $message
        ], 200);
    }

    public function newIRFNO(){
        $year = Carbon::now();
        $lastYear = Carbon::now()->subYear();
        $lastYearMax = DB::table('irf_nos')->whereRaw("year(created_at) = $lastYear->year")->max('id') ?? 0;
        $id = DB::table('irf_nos')->whereRaw("year(created_at) = $year->year")->max('id') - $lastYearMax;
        $id = $id < 1 ? 1 : $id++;
        $department = auth_department_name();
        return $id.'/'.$year->format('y').'/'.$department;
    }

    public function newPRFNO(){
        $year = Carbon::now();
        $lastYear = Carbon::now()->subYear()->year;
        $lastYearMax = DB::table('p_r_f_nos')->whereRaw("year(created_at) = $lastYear")->max('id');
        $id = DB::table('p_r_f_nos')->whereRaw("year(created_at) = $year->year")->max('id') - $lastYearMax;
        $id = $id < 1 ? 1 : $id++;
        return $id.'/'.$year->format('y');
    }
}
