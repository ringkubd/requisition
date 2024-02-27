<?php

use App\Models\Pump;
use App\Models\User;
use App\Models\Vehicle;
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
        Schema::create('vehicle_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Vehicle::class)->index()->references('id')->on('vehicles');
            $table->foreignIdFor(\App\Models\CashRequisition::class)->index()->references('id')->on('cash_requisitions');
            $table->date('refuel_date');
            $table->string('unit')->nullable();
            $table->double('quantity');
            $table->double('rate');
            $table->string('bill_no')->nullable();
            $table->double('last_mileage');
            $table->foreignIdFor(Pump::class)->nullable()->references('id')->on('pumps');
            $table->foreignIdFor(User::class)->index()->references('id')->on('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_histories');
    }
};
