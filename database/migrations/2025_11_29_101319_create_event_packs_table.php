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
        Schema::create('event_packs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Gold, Silver, Bronze, etc.
            $table->string('slug');
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // Liste des avantages inclus
            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency')->default('XOF');
            $table->integer('max_participants')->nullable(); // Limite de places
            $table->integer('current_participants')->default(0);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['event_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_packs');
    }
};
