<?php

namespace Database\Seeders;

use App\Models\FedaPayConfig;
use Illuminate\Database\Seeder;

class FedaPayConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        FedaPayConfig::updateOrCreate(
            [],
            [
                'public_key_sandbox' => 'pk_sandbox_lkJTKsEHbrbXp_ItyhNCBhks',
                'secret_key_sandbox' => 'sk_sandbox_JBYnyxCIa9823jUrXFx2pu2b',
                'is_sandbox' => true,
            ]
        );
    }
}