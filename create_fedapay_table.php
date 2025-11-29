<?php

/**
 * Script direct pour créer la table feda_pay_configs
 * 
 * Utilisation: php create_fedapay_table.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\FedaPayConfig;

echo "=== Initialisation de la table FedaPay ===\n\n";

// Supprimer les anciennes tables
try {
    Schema::dropIfExists('fedapay_configs');
    echo "✓ Ancienne table 'fedapay_configs' supprimée si elle existait\n";
} catch (\Exception $e) {
    echo "⚠ Erreur lors de la suppression de l'ancienne table: " . $e->getMessage() . "\n";
}

// Créer la table
if (!Schema::hasTable('feda_pay_configs')) {
    echo "Création de la table 'feda_pay_configs'...\n";
    
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
        echo "✓ Table créée avec succès!\n\n";
    } catch (\Exception $e) {
        echo "✗ Erreur lors de la création de la table: " . $e->getMessage() . "\n";
        exit(1);
    }
} else {
    echo "✓ La table 'feda_pay_configs' existe déjà\n\n";
}

// Vérifier que la table existe
if (!Schema::hasTable('feda_pay_configs')) {
    echo "✗ ERREUR: La table n'a pas été créée!\n";
    exit(1);
}

// Insérer les données initiales
echo "Insertion de la configuration initiale...\n";
try {
    $config = FedaPayConfig::updateOrCreate(
        [],
        [
            'public_key_sandbox' => 'pk_sandbox_lkJTKsEHbrbXp_ItyhNCBhks',
            'secret_key_sandbox' => 'sk_sandbox_JBYnyxCIa9823jUrXFx2pu2b',
            'is_sandbox' => true,
        ]
    );
    echo "✓ Configuration insérée avec succès!\n\n";
} catch (\Exception $e) {
    echo "✗ Erreur lors de l'insertion: " . $e->getMessage() . "\n";
    exit(1);
}

// Vérification finale
$config = FedaPayConfig::first();
if ($config) {
    echo "=== Vérification finale ===\n";
    echo "✓ Configuration trouvée!\n";
    echo "  - Clé publique sandbox: " . substr($config->public_key_sandbox ?? 'NON DÉFINIE', 0, 30) . "...\n";
    echo "  - Clé secrète sandbox: " . (empty($config->secret_key_sandbox) ? 'NON DÉFINIE' : 'DÉFINIE') . "\n";
    echo "  - Mode sandbox: " . ($config->is_sandbox ? 'OUI' : 'NON') . "\n";
    echo "\n✓ Initialisation terminée avec succès!\n";
} else {
    echo "✗ ERREUR: Aucune configuration trouvée après l'insertion!\n";
    exit(1);
}