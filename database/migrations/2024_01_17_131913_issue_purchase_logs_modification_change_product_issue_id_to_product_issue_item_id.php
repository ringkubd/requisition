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
        Schema::table('issue_purchase_logs', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\ProductIssueItems::class)->after('id')->index()->references('id')->on('product_issue_items');
            if(Schema::hasColumn('issue_purchase_logs','product_issue_id')){
                $table->dropForeignIdFor(\App\Models\ProductIssue::class);
                $table->dropColumn('product_issue_id');
            };
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issue_purchase_logs', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\ProductIssueItems::class);
            $table->dropColumn('product_issue_items_id');
        });
    }
};
