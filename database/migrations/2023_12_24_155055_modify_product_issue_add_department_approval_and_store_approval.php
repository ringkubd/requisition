<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Branch::class, 'issuer_branch_id')->after('issuer_id')->nullable()->index()->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class, 'issuer_department_id')->after('issuer_branch_id')->nullable()->index()->references('id')->on('departments');
            $table->tinyInteger('department_status')->default(0)->after('issue_time')->comment('0 => pending, 1 => approved, 2 => rejected');
            $table->foreignIdFor(\App\Models\User::class,'department_approved_by')->index()->nullable()->after('department_status')->references('id')->on('users');
            $table->tinyInteger('store_status')->default(0)->after('department_approved_by')->comment('0 => pending, 1 => approved, 2 => rejected');
            $table->foreignIdFor(\App\Models\User::class,'store_approved_by')->index()->nullable()->after('department_approved_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Branch::class, 'issuer_branch_id');
            $table->dropColumn('issuer_branch_id');

            $table->dropForeignIdFor(\App\Models\Department::class, 'issuer_department_id');
            $table->dropColumn('issuer_department_id');

            $table->dropColumn('department_status');
            $table->dropForeignIdFor(\App\Models\User::class,'department_approved_by');
            $table->dropColumn('department_approved_by');

            $table->dropColumn('store_status');
            $table->dropForeignIdFor(\App\Models\User::class,'store_approved_by');
            $table->dropColumn('store_approved_by');
        });
    }
};
