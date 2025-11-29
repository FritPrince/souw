<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateFedaPayTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fedapay:create-table';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create the fedapay_configs table';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (Schema::hasTable('feda_pay_configs')) {
            $this->info('Table feda_pay_configs already exists.');
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
                )
            ");

            $this->info('Table fedapay_configs created successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error creating table: ' . $e->getMessage());
            return 1;
        }
    }
}