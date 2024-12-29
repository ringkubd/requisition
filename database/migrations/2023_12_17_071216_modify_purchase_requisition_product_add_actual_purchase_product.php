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
        Schema::table('purchase_requisition_products', function (Blueprint $table) {
            $table->double('actual_purchase')->default(0)->after('quantity_to_be_purchase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requisition_products', function (Blueprint $table) {
            $table->dropColumn('actual_purchase');
        });
    }
};
