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
        Schema::table('services', function (Blueprint $table) {
            // Mode de tarification pour les services avec rendez-vous:
            // 'service_plus_appointment' = Prix du service + Prix du rendez-vous
            // 'appointment_only' = Prix du rendez-vous uniquement
            $table->string('appointment_pricing_mode')->default('service_plus_appointment')->after('requires_appointment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('appointment_pricing_mode');
        });
    }
};
