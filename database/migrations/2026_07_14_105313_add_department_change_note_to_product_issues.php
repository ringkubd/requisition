<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->text('department_change_note')->nullable()->after('store_approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('product_issues', function (Blueprint $table) {
            $table->dropColumn('department_change_note');
        });
    }
};
