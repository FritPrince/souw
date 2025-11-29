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
        Schema::table('categories', function (Blueprint $table) {
            // Supprimer les champs inutiles
            $table->dropColumn(['icon', 'icon_path', 'video_path', 'media_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('description');
            $table->string('icon_path')->nullable()->after('icon');
            $table->string('video_path')->nullable()->after('image_path');
            $table->string('media_type')->nullable()->after('video_path');
        });
    }
};
