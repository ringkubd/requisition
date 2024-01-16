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
        Schema::create('product_issue_basics', function (Blueprint $table) {
            $table->id();
            $table->uuid()->index();
            $table->foreignIdFor(\App\Models\User::class, 'receiver_id')->references('id')->on('users');
            $table->foreignIdFor(\App\Models\Branch::class, 'receiver_branch_id')->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class, 'receiver_department_id')->references('id')->on('departments');
            $table->foreignIdFor(\App\Models\User::class, 'issuer_id')->references('id')->on('users');
            $table->foreignIdFor(\App\Models\Branch::class, 'issuer_branch_id')->nullable()->index()->references('id')->on('branches');
            $table->foreignIdFor(\App\Models\Department::class, 'issuer_department_id')->nullable()->index()->references('id')->on('departments');
            $table->integer('number_of_item');
            $table->timestamp('issue_time')->nullable();
            $table->tinyInteger('department_status')->default(0)->comment('0 => pending, 1 => approved, 2 => rejected');
            $table->foreignIdFor(\App\Models\User::class,'department_approved_by')->index()->nullable()->references('id')->on('users');
            $table->tinyInteger('store_status')->default(false)->comment('0 => pending, 1 => approved, 2 => rejected');
            $table->foreignIdFor(\App\Models\User::class,'store_approved_by')->index()->nullable()->references('id')->on('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_issue_basics');
    }
};
