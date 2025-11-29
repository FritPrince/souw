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
        Schema::create('kkia_pay_configs', function (Blueprint $table) {
            $table->id();
            $table->string('public_key_live')->nullable();
            $table->string('private_key_live')->nullable();
            $table->string('secret_live')->nullable();
            $table->string('public_key_sandbox')->nullable();
            $table->string('private_key_sandbox')->nullable();
            $table->string('secret_sandbox')->nullable();
            $table->boolean('is_sandbox')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkia_pay_configs');
    }
};
