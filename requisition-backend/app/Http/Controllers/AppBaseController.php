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
        $id = DB::table('irf_nos')->max('id');
        if (!$id){
            $statement = DB::select("show table status like 'irf_nos'");
            $id = $statement[0]->Auto_increment;
        }else{
            $id++;
        }
        $year = Carbon::now()->format('y');
        $department = auth_department_name();
        return $id.'/'.$year.'/'.$department;
    }
}
