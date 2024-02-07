<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_issue_items', function (Blueprint $table) {
            $table->date('use_date')->nullable()->useCurrent()->after('use_in_category')->index();
        });

        if(Schema::hasColumn('product_issue_items', 'use_date')){
            DB::update("UPDATE `product_issue_items` as pii JOIN product_issues as pi on pi.uuid=pii.uuid SET pii.use_date=pi.issue_time");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issue_items', function (Blueprint $table) {
            $table->dropColumn('use_date');
        });
    }
};
