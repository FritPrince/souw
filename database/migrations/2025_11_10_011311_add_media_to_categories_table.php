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
            $table->string('image_path')->nullable()->after('description');
            $table->string('video_path')->nullable()->after('image_path');
            $table->enum('media_type', ['image', 'video'])->nullable()->after('video_path')->comment('Type de média principal à afficher');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'video_path', 'media_type']);
        });
    }
};
