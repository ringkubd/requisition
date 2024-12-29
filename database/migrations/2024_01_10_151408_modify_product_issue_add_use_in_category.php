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
            $table->foreignIdFor(\App\Models\Category::class, 'use_in_category')->after('product_option_id')->nullable()->references('id')->on('categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Category::class, 'use_in_category');
            $table->dropColumn('use_in_category');
        });
    }
};
