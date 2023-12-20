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
            $table->renameColumn('user_id','department_approved_by');
            $table->foreignIdFor(\App\Models\User::class, 'accounts_approved_by')->nullable()->index()->after('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_statuses', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\User::class, 'accounts_approved_by');
            $table->renameColumn('department_approved_by','user_id');
        });
    }
};
