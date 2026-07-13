<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->index('purchase_date', 'idx_purchases_purchase_date');
            $table->index('created_at', 'idx_purchases_created_at');
            $table->index('updated_at', 'idx_purchases_updated_at');
        });

        Schema::table('product_issue_items', function (Blueprint $table) {
            $table->index('updated_at', 'idx_product_issue_items_updated_at');
        });

        Schema::table('initial_requisitions', function (Blueprint $table) {
            $table->index('created_at', 'idx_initial_requisitions_created_at');
        });

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->index('created_at', 'idx_purchase_requisitions_created_at');
        });

        Schema::table('cash_requisitions', function (Blueprint $table) {
            $table->index('created_at', 'idx_cash_requisitions_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropIndex('idx_purchases_purchase_date');
            $table->dropIndex('idx_purchases_created_at');
            $table->dropIndex('idx_purchases_updated_at');
        });

        Schema::table('product_issue_items', function (Blueprint $table) {
            $table->dropIndex('idx_product_issue_items_updated_at');
        });

        Schema::table('initial_requisitions', function (Blueprint $table) {
            $table->dropIndex('idx_initial_requisitions_created_at');
        });

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->dropIndex('idx_purchase_requisitions_created_at');
        });

        Schema::table('cash_requisitions', function (Blueprint $table) {
            $table->dropIndex('idx_cash_requisitions_created_at');
        });
    }
};
