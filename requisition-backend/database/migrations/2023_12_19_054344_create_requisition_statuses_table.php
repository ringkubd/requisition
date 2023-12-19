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
        Schema::create('requisition_statuses', function (Blueprint $table) {
            $table->id();
            $table->morphs('requisition');
            $table->foreignIdFor(\App\Models\Department::class)->index()->references('id')->on('departments');
            $table->tinyInteger('department_status')->default(0)->comment('0 => not arrived, 1 => pending, 2 => approved, 3 => rejected, 4 => required change');
            $table->tinyInteger('accounts_status')->default(0)->comment('0 => not arrived, 1 => pending, 2 => approved, 3 => rejected, 4 => required change');
            $table->tinyInteger('ceo_status')->default(0)->comment('0 => not arrived, 1 => pending, 2 => approved, 3 => rejected, 4 => required change');
            $table->text('notes')->nullable();
            $table->foreignIdFor(\App\Models\User::class)->index()->references('id')->on('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_statuses');
    }
};
