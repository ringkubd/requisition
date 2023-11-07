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
            $table->foreignIdFor(\App\Models\Brand::class)->nullable()->after('product_option_id')->references('id')->on('brands');
            $table->string('notes', 500)->nullable()->after('available_qty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('brand_id');
            $table->dropColumn('notes');
        });
    }
};
