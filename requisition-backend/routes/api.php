<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//    $token = $request->user()->createToken($request->user()->email);
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function (){
    Route::apiResource('organization', \App\Http\Controllers\API\OrganizationApiController::class);
});


Route::resource('branches', App\Http\Controllers\API\BranchAPIController::class)
    ->except(['create', 'edit']);

Route::get('branches/{organization_id}/organization', [\App\Http\Controllers\API\OrganizationHelperApiController::class, 'getBranch'])->name('branches.branch_by_organization');


Route::resource('categories', App\Http\Controllers\API\CategoryAPIController::class)
    ->except(['create', 'edit']);

Route::resource('options', App\Http\Controllers\API\OptionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('product-options', App\Http\Controllers\API\ProductOptionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('departments', App\Http\Controllers\API\DepartmentAPIController::class)
    ->except(['create', 'edit']);

Route::resource('designations', App\Http\Controllers\API\DesignationAPIController::class)
    ->except(['create', 'edit']);


Route::resource('products', App\Http\Controllers\API\ProductAPIController::class)
    ->except(['create', 'edit']);
