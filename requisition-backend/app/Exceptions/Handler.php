<?php

namespace App\Exceptions;

use App\Events\ExceptionEvent;
use App\Models\Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
        });
        $exceptionData = false;
        $this->renderable(function (NotFoundHttpException $exception, Request $request){
            if ($request->is('api/*')){
                $exceptionData = Exception::create([
                    'user_id' => $request->user()?->id,
                    'trace' => json_encode($exception->getTrace()),
                    'message' => $exception->getMessage(),
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'url' => $request->url(),
                    'ip_address' => $request->getClientIp(),
                    'request' => json_encode($request->all()),
                    'exception_type' => 'NotFoundHttpException'
                ]);
                broadcast(new ExceptionEvent($exceptionData));
                return response()->json([
                    'message' => 'Route not found.'
                ], 404);
            }
        });
        $this->renderable(function (ModelNotFoundException $exception, Request $request){
            if ($request->is('api/*')){
                $exceptionData = Exception::create([
                    'user_id' => $request->user()?->id,
                    'trace' => json_encode($exception->getTrace()),
                    'message' => $exception->getMessage(),
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'url' => $request->url(),
                    'ip_address' => $request->getClientIp(),
                    'model_id' => $exception->getIds(),
                    'model_type' => $exception->getModel(),
                    'request' => json_encode($request->all()),
                    'exception_type' => 'ModelNotFoundException'
                ]);
                broadcast(new ExceptionEvent($exceptionData));

                return response()->json([
                    'message' => 'Record not found.'
                ], 404);
            }
        });
        $this->renderable(function (\Exception $exception, Request $request){
            if ($request->is('api/*')){
                $exceptionData = Exception::create([
                    'user_id' => $request->user()?->id,
                    'trace' => json_encode($exception->getTrace()),
                    'message' => $exception->getMessage(),
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'url' => $request->url(),
                    'ip_address' => $request->getClientIp(),
                    'request' => json_encode($request->all()),
                    'exception_type' => 'Exception'
                ]);
                broadcast(new ExceptionEvent($exceptionData));
                return response()->json([
                    'message' => $exception->getMessage()
                ], $exception->getCode());
            }
        });

    }
}
