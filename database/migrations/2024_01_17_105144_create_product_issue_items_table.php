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
        Schema::create('product_issue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\ProductIssue::class)->index()->references('id')->on('product_issues');
            $table->foreignIdFor(\App\Models\Product::class)->references('id')->on('products');
            $table->foreignIdFor(\App\Models\ProductOption::class)->references('id')->on('product_options');
            $table->foreignIdFor(\App\Models\Category::class, 'use_in_category')->nullable()->references('id')->on('categories');
            $table->double('quantity');
            $table->double('balance_before_issue')->nullable();
            $table->double('balance_after_issue')->nullable();
            $table->string('purpose')->nullable();
            $table->string('uses_area')->nullable();
            $table->string('note')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_issue_items');
    }
};
