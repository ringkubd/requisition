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
        Schema::table('product_issues', function (Blueprint $table) {
            if (Schema::hasColumn('product_issues', 'purchase_requisition_id')){
                $table->dropConstrainedForeignIdFor(\App\Models\PurchaseRequisition::class);
            }
            $table->string('purpose')->nullable()->after('issuer_id');
            $table->string('uses_area')->nullable()->after('purpose');
            $table->string('note')->nullable()->after('uses_area');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropColumn('purpose');
            $table->dropColumn('uses_area');
            $table->dropColumn('note');
        });
    }
};
