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
        Schema::table('initial_requisitions', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Branch::class)->nullable()->index()->after('user_id')->references('id')->on('branches')->noActionOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('initial_requisitions', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(\App\Models\Branch::class);
        });
    }
};
