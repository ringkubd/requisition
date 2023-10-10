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
            $table->double('unit_price', 20,2)->after('quantity_to_be_purchase')->default(0);
            $table->date('last_purchase_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_requisition_products', function (Blueprint $table) {
            //
        });
    }
};
