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
        Schema::create('cash_requisitions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\User::class)->index()->references('id')->on('users');
            $table->foreignIdFor(\App\Models\Branch::class)->index()->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class)->index()->references('id')->on('departments');
            $table->string('irf_no')->index();
            $table->string('ir_no')->index();
            $table->double('total_cost');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_requisitions');
    }
};
