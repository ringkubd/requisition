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
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\Organization::class)->after('id')->index()->default(1)->references('id')->on('organizations');
            $table->foreignIdFor(\App\Models\Branch::class)->after('organization_id')->index()->default(1)->references('id')->on('branches');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Organization::class);
            $table->dropColumn('organization_id');
            $table->dropForeignIdFor(\App\Models\Branch::class);
            $table->dropColumn('branch_id');
        });
    }
};