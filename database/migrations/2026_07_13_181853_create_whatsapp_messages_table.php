<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('webhook_log_id')->nullable()->index();
            $table->string('wa_message_id')->nullable()->index();
            $table->string('from_phone', 32)->nullable()->index();
            $table->string('to_phone', 32)->nullable()->index();
            $table->string('type', 32)->nullable()->index();
            $table->text('text')->nullable();
            $table->string('status_event', 32)->nullable();
            $table->string('contact_name', 255)->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('msg_timestamp')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
