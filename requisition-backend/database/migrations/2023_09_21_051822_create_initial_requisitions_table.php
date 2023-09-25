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
        Schema::create('initial_requisitions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\User::class)->references('id')->on('users');
            $table->foreignIdFor(\App\Models\Department::class)->references('id')->on('departments');
            $table->string('irf_no');
            $table->string('ir_no')->default('05');
            $table->float('estimated_cost', 10, 4)->nullable();
            $table->boolean('is_purchase_requisition_generated')->default(0)->comment('0 => No, 1 => Yes');
            $table->boolean('is_purchase_done')->default(0)->comment('0 => No, 1 => Yes');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('initial_requisitions');
    }
};
