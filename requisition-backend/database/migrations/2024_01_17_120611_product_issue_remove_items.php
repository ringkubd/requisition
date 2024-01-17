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
            if (Schema::hasColumn('product_issues', 'product_id')){
                $table->dropForeignIdFor(\App\Models\Product::class);
                $table->dropColumn('product_id');
            }
            if (Schema::hasColumn('product_issues', 'product_option_id')){
                $table->dropForeignIdFor(\App\Models\ProductOption::class);
                $table->dropColumn('product_option_id');
            }
            if (Schema::hasColumn('product_issues', 'use_in_category')){
                $table->dropForeignIdFor(\App\Models\Category::class, 'use_in_category');
                $table->dropColumn('use_in_category');
            }
            if (Schema::hasColumn('product_issues', 'quantity')){
                $table->dropColumn('quantity');
            }
            if (Schema::hasColumn('product_issues', 'purpose')){
                $table->dropColumn('purpose');
            }
            if (Schema::hasColumn('product_issues', 'uses_area')){
                $table->dropColumn('uses_area');
            }
            if (Schema::hasColumn('product_issues', 'note')){
                $table->dropColumn('note');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            //
        });
    }
};
