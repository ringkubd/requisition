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
        Schema::table('vehicle_histories', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\CashRequisitionItem::class)
                ->after('cash_requisition_id')
                ->index()
                ->references('id')
                ->on('cash_requisition_items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_histories', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\CashRequisitionItem::class);
            $table->dropColumn('cash_requisition_item_id');
        });
    }
};
