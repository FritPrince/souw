<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\FedaPayConfig;

class InitializeFedaPay extends Command
{
    protected $signature = 'fedapay:init';
    protected $description = 'Initialize FedaPay configuration table and data';

    public function handle(): int
    {
        $this->info('Initializing FedaPay configuration...');

        // Supprimer les anciennes tables si elles existent
        Schema::dropIfExists('fedapay_configs');
        
        // Créer la table si elle n'existe pas
        if (!Schema::hasTable('feda_pay_configs')) {
            $this->info('Creating table feda_pay_configs...');
            
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
                $this->info('✓ Table created successfully!');
            } catch (\Exception $e) {
                $this->error('✗ Error creating table: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->info('✓ Table already exists.');
        }

        // Vérifier que la table existe
        if (!Schema::hasTable('feda_pay_configs')) {
            $this->error('✗ Table was not created!');
            return 1;
        }

        // Insérer les données initiales
        $this->info('Inserting initial configuration...');
        try {
            FedaPayConfig::updateOrCreate(
                [],
                [
                    'public_key_sandbox' => 'pk_sandbox_lkJTKsEHbrbXp_ItyhNCBhks',
                    'secret_key_sandbox' => 'sk_sandbox_JBYnyxCIa9823jUrXFx2pu2b',
                    'is_sandbox' => true,
                ]
            );
            $this->info('✓ Configuration inserted successfully!');
        } catch (\Exception $e) {
            $this->error('✗ Error inserting configuration: ' . $e->getMessage());
            return 1;
        }

        // Vérifier que tout fonctionne
        $config = FedaPayConfig::first();
        if ($config) {
            $this->info('✓ Verification successful!');
            $this->info('  - Public Key: ' . substr($config->public_key_sandbox ?? 'NOT SET', 0, 30) . '...');
            $this->info('  - Secret Key: ' . (empty($config->secret_key_sandbox) ? 'NOT SET' : 'SET'));
            $this->info('  - Sandbox Mode: ' . ($config->is_sandbox ? 'YES' : 'NO'));
        } else {
            $this->error('✗ Verification failed: No configuration found!');
            return 1;
        }

        $this->info('');
        $this->info('✓ FedaPay initialization completed successfully!');
        return 0;
    }
}