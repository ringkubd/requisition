<?php

use App\Http\Controllers\API\CategoryAPIController;
use App\Http\Controllers\API\InitialRequisitionAPIController;
use App\Http\Controllers\API\NavigationAPIController;
use App\Http\Controllers\API\ProductAPIController;
use App\Http\Controllers\API\PurchaseAPIController;
use App\Http\Controllers\API\PurchaseRequisitionAPIController;
use App\Http\Controllers\API\RoleAPIController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
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

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return  new UserResource($request->user());
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::resource('organization', App\Http\Controllers\API\OrganizationApiController::class)->except(['create', 'edit']);

Route::resource('branches', App\Http\Controllers\API\BranchAPIController::class)
    ->except(['create', 'edit']);

Route::get('branches_organization', [App\Http\Controllers\API\OrganizationHelperApiController::class, 'getBranch'])
    ->name('branches.branch_by_organization');


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
Route::get('product-select', [InitialRequisitionAPIController::class, 'products']);
Route::get('category-select', [InitialRequisitionAPIController::class, 'category']);
Route::get('suppliers-select', [PurchaseAPIController::class, 'suppliers']);
Route::get('purchase-requisition-select', [PurchaseAPIController::class, 'purchaseRequisition']);

Route::get('last-purchase-information', [InitialRequisitionAPIController::class, 'lastPurchase']);

Route::post('change-organization', function (Request $request){
    cache()->forget('select_organization_'.$request->user()->id);
    cache()->put('select_organization_'.$request->user()->id,$request->organization_id);
    cache()->forget('select_branch_'.$request->user()->id);
    cache()->forget('select_department_'.$request->user()->id);
    return cache()->get('select_organization_'.$request->user()->id);
});
Route::post('change-branch', function (Request $request){
    cache()->forget('select_branch_'.$request->user()->id);
    cache()->forget('select_department_'.$request->user()->id);
    cache()->put('select_branch_'.$request->user()->id,$request->branch_id);
    return cache()->get('select_branch_'.$request->user()->id);
});
Route::post('change-departments', function (Request $request){
    cache()->forget('select_department_'.$request->user()->id);
    cache()->put('select_department_'.$request->user()->id,$request->department_id);
    return cache()->get('select_department_'.$request->user()->id);
});

Route::get('navigation-organization', [NavigationAPIController::class, 'organization']);
Route::get('navigation-branch', [NavigationAPIController::class, 'branch']);
Route::get('navigation-department', [NavigationAPIController::class, 'department']);


Route::get('initial_requisition_for_initiate_purchase', [PurchaseRequisitionAPIController::class, 'getInitialRequisition']);
Route::get('initial_requisition_product_suggestions', [InitialRequisitionAPIController::class, 'purposeSuggestions']);
Route::post('update_purchase_requisition_product_price', [PurchaseRequisitionAPIController::class, 'updateProductPrice']);

Route::get('sub-category/{parent}', [CategoryAPIController::class, 'subCategory']);
/**
 * End Extra URL
 */

Route::resource('purchase-requisitions', App\Http\Controllers\API\PurchaseRequisitionAPIController::class)
    ->except(['create', 'edit']);


Route::resource('users', App\Http\Controllers\API\UserAPIController::class)
    ->except(['create', 'edit']);


Route::resource('suppliers', App\Http\Controllers\API\SupplierAPIController::class)
    ->except(['create', 'edit']);

Route::resource('purchases', App\Http\Controllers\API\PurchaseAPIController::class)
    ->except(['create', 'edit']);


Route::resource('product-issues', App\Http\Controllers\API\ProductIssueAPIController::class)
    ->except(['create', 'edit']);
Route::put('product-issues-quantity-update/{id}', [\App\Http\Controllers\API\ProductIssueAPIController::class, 'updateQuantity']);


Route::resource('brands', App\Http\Controllers\API\BrandAPIController::class)
    ->except(['create', 'edit']);

Route::resource('roles', App\Http\Controllers\API\RoleAPIController::class)
    ->except(['create', 'edit']);

Route::get('permission_for_role', [RoleAPIController::class, 'permissions']);
Route::post('role_permission_update/{role}', [RoleAPIController::class, 'rolePermissionUpdate']);

Route::resource('permissions', App\Http\Controllers\API\PermissionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('countries', App\Http\Controllers\API\CountryAPIController::class)
    ->except(['create', 'edit']);

Route::resource('measurement-units', App\Http\Controllers\API\MeasurementUnitAPIController::class)
    ->except(['create', 'edit']);


Route::resource('cash-products', App\Http\Controllers\API\CashProductAPIController::class)
    ->except(['create', 'edit']);

Route::resource('cash-requisitions', App\Http\Controllers\API\CashRequisitionAPIController::class)
    ->except(['create', 'edit']);

Route::resource('cash-requisition-items', App\Http\Controllers\API\CashRequisitionItemAPIController::class)
    ->except(['create', 'edit']);

Route::get('dashboard-data', [\App\Http\Controllers\API\DashboardAPIController::class, 'index']);
Route::get('dashboard-cash-data', [\App\Http\Controllers\API\DashboardAPIController::class, 'cash']);
Route::get('activity', [\App\Http\Controllers\API\ActivityController::class, 'index']);

Route::prefix('report')->group(function (){
    Route::get('product', [ProductAPIController::class, 'report']);
    Route::get('daily', [\App\Http\Controllers\API\ReportAPIController::class, 'dailyReport']);
    Route::get('purchase', [\App\Http\Controllers\API\ReportAPIController::class, 'purchaseReport']);
    Route::get('issues', [\App\Http\Controllers\API\ReportAPIController::class, 'issueReport']);
    Route::get('both', [\App\Http\Controllers\API\ReportAPIController::class, 'bothReport']);
    Route::get('product-current-balance', [\App\Http\Controllers\API\ReportAPIController::class, 'currentBalance']);
});

Route::put('update_initial_status/{requisition}', [InitialRequisitionAPIController::class, 'changeStatusDepartment']);
Route::put('update_purchase_status/{requisition}', [PurchaseRequisitionAPIController::class, 'changeStatusDepartment']);
Route::put('update_cash_status/{requisition}', [\App\Http\Controllers\API\CashRequisitionAPIController::class, 'changeStatusDepartment']);

Route::post('subscribe-push', [NavigationAPIController::class, 'subscribeWebPush']);
Route::post('one_time_login', [\App\Http\Controllers\API\UserAPIController::class, 'oneTimeLogin']);


Route::resource('product-issue-items', App\Http\Controllers\API\ProductIssueItemsAPIController::class)
    ->except(['create', 'edit']);
