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
        Schema::create('product_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\PurchaseRequisition::class)->references('id')->on('purchase_requisitions');
            $table->foreignIdFor(\App\Models\Product::class)->references('id')->on('products');
            $table->foreignIdFor(\App\Models\ProductOption::class)->references('id')->on('product_options');
            $table->double('quantity');
            $table->foreignIdFor(\App\Models\User::class, 'receiver_id')->references('id')->on('users');
            $table->foreignIdFor(\App\Models\User::class, 'issuer_id')->references('id')->on('users');
            $table->timestamp('issue_time')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_issues');
    }
};
