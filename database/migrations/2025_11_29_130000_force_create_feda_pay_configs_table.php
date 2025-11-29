<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Supprimer la table si elle existe avec un mauvais nom
        Schema::dropIfExists('fedapay_configs');
        
        // Créer la table avec le bon nom
        if (!Schema::hasTable('feda_pay_configs')) {
            DB::statement("
                CREATE TABLE feda_pay_configs (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    public_key_live VARCHAR(255) NULL,
                    secret_key_live VARCHAR(255) NULL,
                    public_key_sandbox VARCHAR(255) NULL,
                    secret_key_sandbox VARCHAR(255) NULL,
                    is_sandbox TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feda_pay_configs');
        Schema::dropIfExists('fedapay_configs');
    }
};