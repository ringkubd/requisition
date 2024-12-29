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
        Schema::create('exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\User::class)->nullable()->references('id')->on('users');
            $table->json('trace')->nullable();
            $table->string('message')->nullable();
            $table->integer('code')->nullable();
            $table->string('file', 500)->nullable();
            $table->integer('line')->nullable();
            $table->string('url')->nullable()->index();
            $table->ipAddress('ip_address')->nullable()->index();
            $table->json('request')->nullable();
            $table->bigInteger('model_id')->nullable();
            $table->string('model_type')->nullable();
            $table->string('exception_type')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exceptions');
    }
};
