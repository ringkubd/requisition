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
        Schema::create('initial_requisition_products', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\InitialRequisition::class)->references('id')->on('initial_requisitions');
            $table->foreignIdFor(\App\Models\Product::class)->references('id')->on('products');
            $table->foreignIdFor(\App\Models\ProductOption::class)->references('id')->on('product_options');
            $table->date('last_purchase_date');
            $table->float('required_quantity')->default(0);
            $table->float('available_quantity')->default(0);
            $table->float('quantity_to_be_purchase')->default(0);
            $table->string('purpose');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('initial_requisition_products');
    }
};
