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
            $table->string('hero_image_path')->nullable()->after('logo_path');
            $table->string('hero_video_path')->nullable()->after('hero_image_path');
            $table->enum('hero_media_type', ['image', 'video'])->nullable()->after('hero_video_path')->comment('Type de média pour la section hero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_infos', function (Blueprint $table) {
            $table->dropColumn(['hero_image_path', 'hero_video_path', 'hero_media_type']);
        });
    }
};
