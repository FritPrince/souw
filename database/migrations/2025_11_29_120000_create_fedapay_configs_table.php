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
        if (!Schema::hasTable('feda_pay_configs')) {
            Schema::create('feda_pay_configs', function (Blueprint $table) {
                $table->id();
                $table->string('public_key_live')->nullable();
                $table->string('secret_key_live')->nullable();
                $table->string('public_key_sandbox')->nullable();
                $table->string('secret_key_sandbox')->nullable();
                $table->boolean('is_sandbox')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feda_pay_configs');
    }
};