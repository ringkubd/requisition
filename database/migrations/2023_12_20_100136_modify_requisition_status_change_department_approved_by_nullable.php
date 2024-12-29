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
            $table->foreignIdFor(\App\Models\User::class, 'department_approved_by')->nullable()->index()->change()->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_statuses', function (Blueprint $table) {
            //
        });
    }
};
