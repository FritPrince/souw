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
            $table->string('info_section1_badge')->nullable()->after('info_section3_image');
            $table->string('info_section2_badge')->nullable()->after('info_section1_badge');
            $table->string('info_section3_badge')->nullable()->after('info_section2_badge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_infos', function (Blueprint $table) {
            $table->dropColumn([
                'info_section1_badge',
                'info_section2_badge',
                'info_section3_badge',
            ]);
        });
    }
};
