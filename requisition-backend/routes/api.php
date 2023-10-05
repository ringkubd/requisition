<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

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

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//    $token = $request->user()->createToken($request->user()->email);
    return  new UserResource($request->user());
});

Route::middleware(['auth:sanctum'])->group(function (){
    Route::apiResource('organization', \App\Http\Controllers\API\OrganizationApiController::class);
});


Route::resource('branches', App\Http\Controllers\API\BranchAPIController::class)
    ->except(['create', 'edit']);

Route::get('branches_organization', [\App\Http\Controllers\API\OrganizationHelperApiController::class, 'getBranch'])->name('branches.branch_by_organization');


Route::resource('categories', App\Http\Controllers\API\CategoryAPIController::class)
    ->except(['create', 'edit']);

Route::resource('options', App\Http\Controllers\API\OptionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('product-options', App\Http\Controllers\API\ProductOptionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('departments', App\Http\Controllers\API\DepartmentAPIController::class)
    ->except(['create', 'edit']);
Route::get('departments-by-organization-branch', [App\Http\Controllers\API\DepartmentAPIController::class, 'getDepartmentByBranchOrganization']);

Route::resource('designations', App\Http\Controllers\API\DesignationAPIController::class)
    ->except(['create', 'edit']);
Route::get('designation-by-organization-branch', [App\Http\Controllers\API\DesignationAPIController::class, 'getDesignationByBranchOrganization']);


Route::resource('products', App\Http\Controllers\API\ProductAPIController::class)
    ->except(['create', 'edit']);


Route::resource('initial-requisitions', App\Http\Controllers\API\InitialRequisitionAPIController::class)
    ->except(['create', 'edit']);


/**
 * Extra URL
 */
Route::get('product-select', [\App\Http\Controllers\API\InitialRequisitionAPIController::class, 'products']);
Route::get('last-purchase-information', [\App\Http\Controllers\API\InitialRequisitionAPIController::class, 'lastPurchase']);
Route::post('change-branch', function (Request $request){
    cache()->forget('select_branch');
    cache()->put('select_branch',$request->branch_id);
    return cache()->get('select_branch');
});
Route::post('change-organization', function (Request $request){
    cache()->forget('select_organization');
    cache()->put('select_organization',$request->organization_id);
    return cache()->get('select_organization');
});

Route::get('initial_requisition_for_initiate_purchase', [\App\Http\Controllers\API\PurchaseRequisitionAPIController::class, 'getInitialRequisition']);
/**
 * End Extra URL
 */

Route::resource('purchase-requisitions', App\Http\Controllers\API\PurchaseRequisitionAPIController::class)
    ->except(['create', 'edit']);


Route::resource('users', App\Http\Controllers\API\UserAPIController::class)
    ->except(['create', 'edit']);
