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
        Schema::table('requisition_statuses', function (Blueprint $table) {
            $table->timestamp('department_approved_at')->after('department_approved_by')->nullable();
            $table->timestamp('accounts_approved_at')->after('accounts_approved_by')->nullable();
            $table->timestamp('ceo_approved_at')->after('ceo_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_statuses', function (Blueprint $table) {
            $table->dropColumn('department_approved_at');
            $table->dropColumn('accounts_approved_at');
            $table->dropColumn('ceo_approved_at');
        });
    }
};
