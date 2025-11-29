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
        Schema::table('appointments', function (Blueprint $table) {
            // Ajouter les champs pour les invités (consultations publiques)
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_email')->nullable()->after('guest_name');
        });

        // Rendre user_id et service_id nullable pour les consultations publiques
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('service_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['guest_name', 'guest_email']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreignId('service_id')->nullable(false)->change();
        });
    }
};
