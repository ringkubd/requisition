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
        Schema::create('issue_purchase_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\ProductIssue::class)->index()->references('id')->on('product_issues');
            $table->foreignIdFor(\App\Models\Purchase::class)->index()->references('id')->on('purchases');
            $table->double('qty');
            $table->double('unit_price');
            $table->double('total_price');
            $table->date('purchase_date');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_purchase_logs');
    }
};
