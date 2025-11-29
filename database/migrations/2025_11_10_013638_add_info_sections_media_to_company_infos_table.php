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
            $table->string('info_section1_image')->nullable()->after('hero_media_type')->comment('Image pour la section 1: Vous ne voyagerez jamais seul');
            $table->string('info_section2_image')->nullable()->after('info_section1_image')->comment('Image pour la section 2: Un monde de choix');
            $table->string('info_section3_image')->nullable()->after('info_section2_image')->comment('Image pour la section 3: Tranquillité d\'esprit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_infos', function (Blueprint $table) {
            $table->dropColumn(['info_section1_image', 'info_section2_image', 'info_section3_image']);
        });
    }
};
