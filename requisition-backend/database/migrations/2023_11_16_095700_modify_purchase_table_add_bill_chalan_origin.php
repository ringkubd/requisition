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
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('origin')->nullable()->after('supplier_id')->index();
            $table->string('bill_no')->nullable()->after('origin')->index();
            $table->string('chalan_no')->nullable()->after('bill_no')->index();
            $table->date('expiry_date')->nullable()->after('chalan_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('origin');
            $table->dropColumn('bill_no');
            $table->dropColumn('chalan_no');
            $table->dropColumn('expiry_date');
        });
    }
};
