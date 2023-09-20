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
        Schema::create('product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Product::class)->references('id')->on('products');
            $table->foreignIdFor(\App\Models\Option::class)->references('id')->on('options');
            $table->string('sku')->nullable();
            $table->string('option_value');
            $table->double('unit_price')->nullable();
            $table->double('stock');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_options');
    }
};
