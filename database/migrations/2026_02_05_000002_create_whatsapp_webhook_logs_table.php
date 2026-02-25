<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('whatsapp_webhook_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            // Raw JSON payload of the request body
            $table->json('payload')->nullable();
            // Headers captured as JSON
            $table->json('headers')->nullable();
            // HTTP method and path for context
            $table->string('method', 16)->nullable();
            $table->string('path')->nullable();
            // Signature header (if any)
            $table->string('signature')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('whatsapp_webhook_logs');
    }
};
