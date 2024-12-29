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
        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\User::class)->after('initial_requisition_id')->references('id')->on('users')->noActionOnDelete();
            $table->foreignIdFor(\App\Models\Branch::class)->after('user_id')->references('id')->on('branches')->noActionOnDelete();
            $table->foreignIdFor(\App\Models\Department::class)->after('branch_id')->references('id')->on('departments')->noActionOnDelete();
            $table->string('irf_no')->after('department_id');
            $table->string('ir_no')->after('irf_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requisitions', function (Blueprint $table) {
        });
    }
};
