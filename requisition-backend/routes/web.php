<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

Route::resource('branches', App\Http\Controllers\BranchController::class);
Route::resource('categories', App\Http\Controllers\CategoryController::class);
Route::resource('options', App\Http\Controllers\OptionController::class);

Route::resource('product-options', App\Http\Controllers\ProductOptionController::class);
Route::resource('departments', App\Http\Controllers\DepartmentController::class);
Route::resource('designations', App\Http\Controllers\DesignationController::class);
Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

//Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');


Route::resource('products', App\Http\Controllers\ProductController::class);

Route::resource('initial-requisitions', App\Http\Controllers\InitialRequisitionController::class);
Route::resource('purchase-requisitions', App\Http\Controllers\PurchaseRequisitionController::class);

Route::resource('users', App\Http\Controllers\UserController::class);