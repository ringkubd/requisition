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
            $table->foreignIdFor(\App\Models\Branch::class, 'receiver_branch_id')->after('receiver_id')->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class, 'receiver_department_id')->after('receiver_branch_id')->references('id')->on('departments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\Branch::class);
            $table->dropConstrainedForeignIdFor(\App\Models\Department::class);
        });
    }
};
