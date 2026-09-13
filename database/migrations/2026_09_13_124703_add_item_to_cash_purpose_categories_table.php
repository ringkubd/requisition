<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cash_purpose_categories', function (Blueprint $table) {
            $table->text('item')->nullable()->after('purpose_hash');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cash_purpose_categories', function (Blueprint $table) {
            $table->dropColumn('item');
        });
    }
};
