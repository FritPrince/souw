<?php

/**
 * Script pour corriger le problème de migration service_images
 * 
 * Usage via SSH sur Hostinger:
 * php database/fix_service_images_migration.php
 * 
 * Ou via tinker:
 * php artisan tinker
 * require 'database/fix_service_images_migration.php';
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Diagnostic de la migration service_images ===\n\n";

// 1. Vérifier si la table existe
$tableExists = Schema::hasTable('service_images');
echo "1. Table service_images existe: " . ($tableExists ? "OUI" : "NON") . "\n";

// 2. Vérifier si la migration est enregistrée
$migrationRegistered = DB::table('migrations')
    ->where('migration', '2025_12_01_120000_create_service_images_table')
    ->exists();
echo "2. Migration enregistrée: " . ($migrationRegistered ? "OUI" : "NON") . "\n";

// 3. Afficher le batch actuel
$maxBatch = DB::table('migrations')->max('batch') ?? 0;
echo "3. Batch maximum actuel: $maxBatch\n\n";

// 4. Proposer la solution
echo "=== Solution ===\n\n";

if (!$tableExists && $migrationRegistered) {
    echo "PROBLÈME: La migration est enregistrée mais la table n'existe pas.\n";
    echo "SOLUTION: Supprimer l'entrée incorrecte de la table migrations.\n\n";
    echo "Exécutez cette commande SQL:\n";
    echo "DELETE FROM migrations WHERE migration = '2025_12_01_120000_create_service_images_table';\n\n";
    echo "Puis relancez: php artisan migrate\n";
} elseif (!$tableExists && !$migrationRegistered) {
    echo "PROBLÈME: La table n'existe pas et la migration n'est pas enregistrée.\n";
    echo "SOLUTION: Créer la table manuellement.\n\n";
    echo "Option 1: Exécuter le script SQL:\n";
    echo "  mysql -u votre_user -p votre_database < database/create_service_images_manual.sql\n\n";
    echo "Option 2: Forcer la migration:\n";
    echo "  php artisan migrate --force\n";
} elseif ($tableExists && !$migrationRegistered) {
    echo "PROBLÈME: La table existe mais la migration n'est pas enregistrée.\n";
    echo "SOLUTION: Enregistrer la migration manuellement.\n\n";
    echo "Exécutez cette commande SQL:\n";
    echo "INSERT INTO migrations (migration, batch) VALUES ('2025_12_01_120000_create_service_images_table', " . ($maxBatch + 1) . ");\n";
} else {
    echo "✓ Tout est correct! La table existe et la migration est enregistrée.\n";
}

echo "\n=== Vérification finale ===\n";
echo "Pour vérifier, exécutez:\n";
echo "  php artisan migrate:status\n";
echo "  php artisan tinker\n";
echo "  Schema::hasTable('service_images')\n";

