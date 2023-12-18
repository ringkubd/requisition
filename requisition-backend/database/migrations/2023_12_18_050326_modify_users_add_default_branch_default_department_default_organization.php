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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Organization::class, 'default_organization_id')->after('password')->index()->nullable()->references('id')->on('organizations');
            $table->foreignIdFor(\App\Models\Branch::class, 'default_branch_id')->after('default_organization_id')->index()->nullable()->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class, 'default_department_id')->after('default_branch_id')->index()->nullable()->references('id')->on('departments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Organization::class, 'default_organization_id');
            $table->dropForeignIdFor(\App\Models\Branch::class, 'default_branch_id');
            $table->dropForeignIdFor(\App\Models\Department::class, 'default_department_id');
        });
    }
};
