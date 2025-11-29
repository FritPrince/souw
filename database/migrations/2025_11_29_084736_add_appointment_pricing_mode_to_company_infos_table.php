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
        Schema::table('company_infos', function (Blueprint $table) {
            // Mode de tarification: 'service_plus_appointment' ou 'appointment_only'
            $table->string('appointment_pricing_mode')->default('service_plus_appointment')->after('appointment_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_infos', function (Blueprint $table) {
            $table->dropColumn('appointment_pricing_mode');
        });
    }
};
