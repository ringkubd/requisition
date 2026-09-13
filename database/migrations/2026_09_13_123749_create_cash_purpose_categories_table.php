<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cash_purpose_categories', function (Blueprint $table) {
            $table->id();
            $table->string('purpose_hash', 40)->unique();
            $table->text('purpose')->nullable();
            $table->string('category')->nullable()->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->float('confidence')->nullable();
            $table->string('model')->nullable();
            $table->boolean('is_manual')->default(false);
            $table->timestamp('classified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cash_purpose_categories');
    }
};
