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
        Schema::create('cash_requisition_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\CashRequisition::class)->references('id')->on('cash_requisitions');
            $table->string('item')->index();
            $table->string('unit');
            $table->double('required_unit');
            $table->double('unit_price');
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
        Schema::dropIfExists('cash_requisition_items');
    }
};
