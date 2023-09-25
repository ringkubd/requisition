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
        Schema::create('purchase_requisitions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\InitialRequisition::class)->references('id')->on('initial_requisitions');
            $table->float('estimated_total_amount');
            $table->float('received_amount')->default(0);
            $table->boolean('payment_type')->comment('Cash, Cheque, LPO, Fund available,Maybe Arranged on');
            $table->boolean('status')->comment('1 => Purchased, 0 => Pending, 2 => Cancel');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_requisitions');
    }
};
