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
        Schema::table('cash_requisition_items', function (Blueprint $table) {
            $table->date('last_purchase_date')->after('purpose')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_requisition_items', function (Blueprint $table) {
            $table->dropColumn('last_purchase_date');
        });
    }
};
