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
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Product::class)->references('id')->on('products')->noActionOnDelete();
            $table->foreignIdFor(\App\Models\Supplier::class)->nullable()->references('id')->on('suppliers')->noActionOnDelete();
            $table->foreignIdFor(\App\Models\PurchaseRequisition::class)->nullable()->references('id')->on('purchase_requisitions')->noActionOnDelete();
            $table->double('qty',20,4);
            $table->double('unit_price', 20,4);
            $table->double('total_price',20,4);
            $table->foreignIdFor(\App\Models\User::class)->references('id')->on('users')->noActionOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
