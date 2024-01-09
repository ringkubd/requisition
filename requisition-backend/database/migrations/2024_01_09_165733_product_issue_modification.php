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
            $table->timestamp('department_approved_at')->after('department_approved_by')->nullable();
            $table->timestamp('store_approved_at')->after('store_approved_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropColumn('department_approved_at');
            $table->dropColumn('store_approved_at');
        });
    }
};
