<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateFedaPayTableDirect extends Command
{
    protected $signature = 'fedapay:create-table-direct';
    protected $description = 'Create feda_pay_configs table directly';

    public function handle(): int
    {
        if (Schema::hasTable('feda_pay_configs')) {
            $this->info('✓ Table feda_pay_configs already exists.');
            return 0;
        }

        try {
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

            $this->info('✓ Table feda_pay_configs created successfully!');
            
            // Vérifier que la table existe
            if (Schema::hasTable('feda_pay_configs')) {
                $this->info('✓ Verification: Table exists in database.');
            } else {
                $this->error('✗ Verification failed: Table does not exist.');
                return 1;
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Error creating table: ' . $e->getMessage());
            return 1;
        }
    }
}